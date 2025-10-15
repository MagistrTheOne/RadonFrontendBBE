// Обработчик streaming для гибридной системы
// Пока не интегрирован в основную логику

export interface StreamingConfig {
  chunkSize: number;
  delay: number;
  maxRetries: number;
  timeout: number;
}

export interface StreamingMessage {
  type: 'token' | 'error' | 'done' | 'model_switch';
  content: string;
  model?: string;
  timestamp: number;
}

export class StreamingHandler {
  private config: StreamingConfig;
  private abortController: AbortController | null = null;

  constructor(config: Partial<StreamingConfig> = {}) {
    this.config = {
      chunkSize: 1024,
      delay: 50,
      maxRetries: 3,
      timeout: 30000,
      ...config
    };
  }

  async streamFromModel(
    model: string,
    requestData: any,
    onMessage: (message: StreamingMessage) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    this.abortController = new AbortController();

    try {
      const response = await this.makeRequest(model, requestData);
      
      if (!response.body) {
        throw new Error('No response body');
      }

      await this.processStream(response, onMessage);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted');
        return;
      }
      
      onError?.(error as Error);
    }
  }

  private async makeRequest(model: string, requestData: any): Promise<Response> {
    const url = this.getModelUrl(model);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify(requestData),
      signal: this.abortController?.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  private async processStream(
    response: Response,
    onMessage: (message: StreamingMessage) => void
  ): Promise<void> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onMessage({
            type: 'done',
            content: '',
            timestamp: Date.now()
          });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            this.processLine(line, onMessage);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private processLine(line: string, onMessage: (message: StreamingMessage) => void) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      
      if (data === '[DONE]') {
        onMessage({
          type: 'done',
          content: '',
          timestamp: Date.now()
        });
        return;
      }

      try {
        const parsed = JSON.parse(data);
        
        if (parsed.error) {
          onMessage({
            type: 'error',
            content: parsed.error,
            timestamp: Date.now()
          });
          return;
        }

        if (parsed.model) {
          onMessage({
            type: 'model_switch',
            content: '',
            model: parsed.model,
            timestamp: Date.now()
          });
          return;
        }

        // Обычный токен
        onMessage({
          type: 'token',
          content: parsed.content || parsed.text || data,
          timestamp: Date.now()
        });

      } catch (error) {
        // Если не JSON, обрабатываем как обычный текст
        onMessage({
          type: 'token',
          content: data,
          timestamp: Date.now()
        });
      }
    }
  }

  private getModelUrl(model: string): string {
    switch (model) {
      case 'radon':
        return process.env.RADON_LOCAL_API_URL || 'http://localhost:8000/api/chat/stream';
      case 'gigachat':
        return process.env.RADON_API_URL || '';
      default:
        throw new Error(`Unknown model: ${model}`);
    }
  }

  abort(): void {
    this.abortController?.abort();
  }

  isActive(): boolean {
    return this.abortController !== null && !this.abortController.signal.aborted;
  }
}

// Utility functions for streaming
export class StreamingUtils {
  static createSSEResponse(stream: ReadableStream): Response {
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
  }

  static createStreamFromGenerator(
    generator: AsyncGenerator<StreamingMessage>
  ): ReadableStream {
    return new ReadableStream({
      async start(controller) {
        try {
          for await (const message of generator) {
            const data = `data: ${JSON.stringify(message)}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));
          }
          controller.close();
        } catch (error) {
          const errorMessage: StreamingMessage = {
            type: 'error',
            content: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
          };
          const data = `data: ${JSON.stringify(errorMessage)}\n\n`;
          controller.enqueue(new TextEncoder().encode(data));
          controller.close();
        }
      }
    });
  }

  static async* streamWithFallback(
    primaryModel: string,
    fallbackModel: string,
    requestData: any,
    streamingHandler: StreamingHandler
  ): AsyncGenerator<StreamingMessage> {
    let currentModel = primaryModel;
    let hasSwitched = false;

    const onMessage = (message: StreamingMessage) => {
      if (message.type === 'model_switch') {
        currentModel = message.model || fallbackModel;
        hasSwitched = true;
      }
    };

    const onError = async (error: Error) => {
      if (!hasSwitched && currentModel === primaryModel) {
        console.log(`Primary model ${primaryModel} failed, switching to ${fallbackModel}`);
        currentModel = fallbackModel;
        hasSwitched = true;
        
        yield {
          type: 'model_switch',
          content: `Переключение на ${fallbackModel}`,
          model: fallbackModel,
          timestamp: Date.now()
        };

        // Рекурсивно вызываем с fallback моделью
        yield* this.streamWithFallback(fallbackModel, primaryModel, requestData, streamingHandler);
      } else {
        yield {
          type: 'error',
          content: error.message,
          timestamp: Date.now()
        };
      }
    };

    try {
      await streamingHandler.streamFromModel(currentModel, requestData, onMessage, onError);
    } catch (error) {
      yield {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }
}
