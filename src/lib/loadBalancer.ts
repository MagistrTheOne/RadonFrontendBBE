// Load Balancer для гибридной системы
// Пока не интегрирован в основную логику

import { ModelType, ModelStats } from './modelManager';

export interface LoadBalancerConfig {
  maxConcurrentRequests: number;
  healthCheckInterval: number;
  performanceWindow: number;
}

export class LoadBalancer {
  private config: LoadBalancerConfig;
  private activeRequests: Map<ModelType, number> = new Map();
  private performanceHistory: Map<ModelType, PerformanceMetric[]> = new Map();

  constructor(config: Partial<LoadBalancerConfig> = {}) {
    this.config = {
      maxConcurrentRequests: 10,
      healthCheckInterval: 30000,
      performanceWindow: 100,
      ...config
    };

    this.initializeMetrics();
    this.startHealthCheck();
  }

  private initializeMetrics() {
    const models: ModelType[] = ['radon', 'gigachat'];
    models.forEach(model => {
      this.activeRequests.set(model, 0);
      this.performanceHistory.set(model, []);
    });
  }

  private startHealthCheck() {
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck() {
    // Проверяем доступность каждой модели
    for (const model of this.activeRequests.keys()) {
      try {
        await this.pingModel(model);
        console.log(`Model ${model} is healthy`);
      } catch (error) {
        console.warn(`Model ${model} health check failed:`, error);
      }
    }
  }

  private async pingModel(model: ModelType): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.getModelUrl(model), {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      
      const responseTime = Date.now() - startTime;
      this.recordPerformance(model, responseTime, response.ok);
      
      return response.ok;
    } catch (error) {
      this.recordPerformance(model, Date.now() - startTime, false);
      return false;
    }
  }

  selectOptimalModel(message: string, userPreference?: ModelType): ModelType {
    // 1. Пользовательский выбор
    if (userPreference && userPreference !== 'auto') {
      return userPreference;
    }

    // 2. Проверка доступности
    const availableModels = this.getAvailableModels();
    if (availableModels.length === 0) {
      throw new Error('No models available');
    }

    // 3. Анализ нагрузки
    const loadAnalysis = this.analyzeLoad();
    
    // 4. Анализ сложности запроса
    const complexity = this.analyzeComplexity(message);

    // 5. Выбор оптимальной модели
    return this.selectBestModel(availableModels, loadAnalysis, complexity);
  }

  private getAvailableModels(): ModelType[] {
    const available: ModelType[] = [];
    
    for (const [model, activeCount] of this.activeRequests) {
      if (activeCount < this.config.maxConcurrentRequests) {
        available.push(model);
      }
    }

    return available;
  }

  private analyzeLoad(): LoadAnalysis {
    const analysis: LoadAnalysis = {
      radon: { load: 0, performance: 0 },
      gigachat: { load: 0, performance: 0 }
    };

    for (const [model, activeCount] of this.activeRequests) {
      analysis[model].load = activeCount / this.config.maxConcurrentRequests;
      analysis[model].performance = this.calculatePerformanceScore(model);
    }

    return analysis;
  }

  private calculatePerformanceScore(model: ModelType): number {
    const history = this.performanceHistory.get(model) || [];
    if (history.length === 0) return 1.0;

    const recentHistory = history.slice(-this.config.performanceWindow);
    const avgResponseTime = recentHistory.reduce((sum, metric) => sum + metric.responseTime, 0) / recentHistory.length;
    const successRate = recentHistory.filter(m => m.success).length / recentHistory.length;

    // Чем быстрее и надежнее, тем выше score
    return successRate / (avgResponseTime / 1000);
  }

  private analyzeComplexity(message: string): 'simple' | 'medium' | 'complex' {
    const complexKeywords = [
      'анализ', 'код', 'программирование', 'математика',
      'научный', 'исследование', 'алгоритм', 'оптимизация',
      'машинное обучение', 'нейронная сеть'
    ];

    const mediumKeywords = [
      'объясни', 'расскажи', 'опиши', 'сравни',
      'разница между', 'как работает'
    ];

    const simpleKeywords = [
      'привет', 'как дела', 'спасибо', 'пока',
      'что такое', 'кто такой'
    ];

    const lowerMessage = message.toLowerCase();

    if (complexKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'complex';
    }

    if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }

    if (simpleKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'simple';
    }

    // Анализ длины и структуры
    if (message.length > 300 || message.includes('\n') || message.includes('```')) {
      return 'complex';
    }

    if (message.length > 100) {
      return 'medium';
    }

    return 'simple';
  }

  private selectBestModel(
    availableModels: ModelType[],
    loadAnalysis: LoadAnalysis,
    complexity: 'simple' | 'medium' | 'complex'
  ): ModelType {
    // Стратегия выбора:
    // - Простые задачи → Radon (если доступен и не перегружен)
    // - Сложные задачи → GigaChat (если доступен)
    // - Средние задачи → Лучшая производительность

    if (complexity === 'simple' && availableModels.includes('radon')) {
      const radonLoad = loadAnalysis.radon.load;
      if (radonLoad < 0.8) {
        return 'radon';
      }
    }

    if (complexity === 'complex' && availableModels.includes('gigachat')) {
      return 'gigachat';
    }

    // Выбираем модель с лучшей производительностью
    let bestModel = availableModels[0];
    let bestScore = 0;

    for (const model of availableModels) {
      const score = loadAnalysis[model].performance * (1 - loadAnalysis[model].load);
      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }

    return bestModel;
  }

  private getModelUrl(model: ModelType): string {
    switch (model) {
      case 'radon':
        return process.env.RADON_LOCAL_API_URL || 'http://localhost:8000/api/chat/stream';
      case 'gigachat':
        return process.env.RADON_API_URL || '';
      default:
        throw new Error(`Unknown model: ${model}`);
    }
  }

  private recordPerformance(model: ModelType, responseTime: number, success: boolean) {
    const history = this.performanceHistory.get(model) || [];
    history.push({
      responseTime,
      success,
      timestamp: Date.now()
    });

    // Ограничиваем историю
    if (history.length > this.config.performanceWindow * 2) {
      history.splice(0, history.length - this.config.performanceWindow);
    }

    this.performanceHistory.set(model, history);
  }

  async executeRequest<T>(
    model: ModelType,
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Увеличиваем счетчик активных запросов
    const currentCount = this.activeRequests.get(model) || 0;
    this.activeRequests.set(model, currentCount + 1);

    try {
      const result = await requestFn();
      return result;
    } finally {
      // Уменьшаем счетчик активных запросов
      const currentCount = this.activeRequests.get(model) || 0;
      this.activeRequests.set(model, Math.max(0, currentCount - 1));
    }
  }

  getLoadStatus(): Map<ModelType, number> {
    return new Map(this.activeRequests);
  }

  getPerformanceHistory(): Map<ModelType, PerformanceMetric[]> {
    return new Map(this.performanceHistory);
  }
}

interface PerformanceMetric {
  responseTime: number;
  success: boolean;
  timestamp: number;
}

interface LoadAnalysis {
  radon: { load: number; performance: number };
  gigachat: { load: number; performance: number };
}

// Singleton instance
export const loadBalancer = new LoadBalancer();
