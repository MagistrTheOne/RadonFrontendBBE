// Менеджер моделей для гибридной системы
// Пока не интегрирован в основную логику

export type ModelType = 'radon' | 'gigachat' | 'auto';

export interface ModelConfig {
  url: string;
  timeout: number;
  fallback: ModelType;
  priority: number;
}

export interface ModelStats {
  responseTime: number;
  successRate: number;
  lastUsed: Date;
  isAvailable: boolean;
}

export class ModelManager {
  private configs: Map<ModelType, ModelConfig> = new Map();
  private stats: Map<ModelType, ModelStats> = new Map();
  private circuitBreakers: Map<ModelType, CircuitBreaker> = new Map();

  constructor() {
    this.initializeConfigs();
    this.initializeStats();
    this.initializeCircuitBreakers();
  }

  private initializeConfigs() {
    this.configs.set('radon', {
      url: process.env.RADON_LOCAL_API_URL || 'http://localhost:8000/api/chat/stream',
      timeout: 5000,
      fallback: 'gigachat',
      priority: 1
    });

    this.configs.set('gigachat', {
      url: process.env.RADON_API_URL || '',
      timeout: 10000,
      fallback: 'radon',
      priority: 2
    });
  }

  private initializeStats() {
    this.configs.forEach((_, model) => {
      this.stats.set(model, {
        responseTime: 0,
        successRate: 1.0,
        lastUsed: new Date(),
        isAvailable: true
      });
    });
  }

  private initializeCircuitBreakers() {
    this.configs.forEach((config, model) => {
      this.circuitBreakers.set(model, new CircuitBreaker({
        timeout: config.timeout,
        errorThresholdPercentage: 50,
        resetTimeout: 30000
      }));
    });
  }

  selectModel(message: string, userPreference?: ModelType): ModelType {
    // 1. Пользовательский выбор
    if (userPreference && userPreference !== 'auto') {
      return userPreference;
    }

    // 2. Автоматический выбор
    return this.autoSelectModel(message);
  }

  private autoSelectModel(message: string): ModelType {
    const complexity = this.analyzeComplexity(message);
    const availableModels = this.getAvailableModels();

    if (availableModels.length === 0) {
      throw new Error('No models available');
    }

    // Для простых задач - Radon, для сложных - GigaChat
    if (complexity === 'simple' && availableModels.includes('radon')) {
      return 'radon';
    } else if (availableModels.includes('gigachat')) {
      return 'gigachat';
    } else {
      return availableModels[0];
    }
  }

  private analyzeComplexity(message: string): 'simple' | 'complex' {
    const complexKeywords = [
      'анализ', 'код', 'программирование', 'математика',
      'научный', 'исследование', 'алгоритм', 'оптимизация'
    ];

    const simpleKeywords = [
      'привет', 'как дела', 'спасибо', 'пока',
      'что такое', 'объясни простыми словами'
    ];

    const lowerMessage = message.toLowerCase();

    if (complexKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'complex';
    }

    if (simpleKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'simple';
    }

    // Анализ длины и структуры
    if (message.length > 200 || message.includes('\n')) {
      return 'complex';
    }

    return 'simple';
  }

  private getAvailableModels(): ModelType[] {
    const available: ModelType[] = [];
    
    for (const [model, stats] of this.stats) {
      if (stats.isAvailable && model !== 'auto') {
        available.push(model);
      }
    }

    return available;
  }

  async callModel(model: ModelType, data: any): Promise<Response> {
    const config = this.configs.get(model);
    const circuitBreaker = this.circuitBreakers.get(model);

    if (!config || !circuitBreaker) {
      throw new Error(`Unknown model: ${model}`);
    }

    const startTime = Date.now();

    try {
      const response = await circuitBreaker.fire(async () => {
        return await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.generateToken()}`,
          },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(config.timeout)
        });
      });

      const responseTime = Date.now() - startTime;
      this.updateStats(model, responseTime, true);

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateStats(model, responseTime, false);
      throw error;
    }
  }

  private updateStats(model: ModelType, responseTime: number, success: boolean) {
    const currentStats = this.stats.get(model);
    if (!currentStats) return;

    // Обновляем статистику
    currentStats.responseTime = (currentStats.responseTime + responseTime) / 2;
    currentStats.successRate = success ? 
      Math.min(1.0, currentStats.successRate + 0.1) : 
      Math.max(0.0, currentStats.successRate - 0.1);
    currentStats.lastUsed = new Date();
    currentStats.isAvailable = currentStats.successRate > 0.3;

    this.stats.set(model, currentStats);
  }

  private generateToken(): string {
    // Генерируем временный токен для FastAPI
    return `temp_token_${Date.now()}`;
  }

  getModelStats(): Map<ModelType, ModelStats> {
    return new Map(this.stats);
  }

  getAvailableModels(): ModelType[] {
    return this.getAvailableModels();
  }
}

// Circuit Breaker implementation
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(private options: {
    timeout: number;
    errorThresholdPercentage: number;
    resetTimeout: number;
  }) {}

  async fire<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.options.errorThresholdPercentage) {
      this.state = 'OPEN';
    }
  }
}

// Singleton instance
export const modelManager = new ModelManager();
