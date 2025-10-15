/**
 * Конфигурация API для Radon AI
 */

export interface ApiConfig {
  // OAuth настройки
  oauth: {
    url: string;
    scope: string;
  };
  
  // API настройки
  api: {
    url: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  
  // Таймауты
  timeouts: {
    oauth: number;
    api: number;
  };
  
  // SSL настройки
  ssl: {
    rejectUnauthorized: boolean;
  };
}

export const getApiConfig = (): ApiConfig => {
  return {
    oauth: {
      url: process.env.RADON_OAUTH_URL || 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
      scope: process.env.RADON_OAUTH_SCOPE || 'GIGACHAT_API_PERS',
    },
    
    api: {
      url: process.env.RADON_API_URL || 'https://gigachat.devices.sberbank.ru/api/v1',
      model: process.env.RADON_MODEL || 'GigaChat:latest',
      maxTokens: parseInt(process.env.RADON_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.RADON_TEMPERATURE || '0.7'),
    },
    
    timeouts: {
      oauth: parseInt(process.env.RADON_OAUTH_TIMEOUT || '10000'),
      api: parseInt(process.env.RADON_API_TIMEOUT || '30000'),
    },
    
    ssl: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  };
};

export const getCredentials = () => {
  const clientId = process.env.RADON_CLIENT_ID;
  const clientSecret = process.env.RADON_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('Radon AI credentials not configured');
  }
  
  return { clientId, clientSecret };
};
