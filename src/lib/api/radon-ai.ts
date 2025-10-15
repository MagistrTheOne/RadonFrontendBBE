import { ChatRequest, ChatResponse } from '@/types/chat';
import { randomUUID } from 'crypto';
import { getApiConfig, getCredentials } from '@/lib/config/apiConfig';
import { tokenCache } from '@/lib/auth/tokenCache';

// Настройка SSL в зависимости от окружения
const config = getApiConfig();
if (!config.ssl.rejectUnauthorized) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Function to get access token using client credentials with caching
async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret } = getCredentials();
  const cacheKey = `${clientId}:${clientSecret}`;
  
  // Проверяем кэш
  const cachedToken = tokenCache.get(cacheKey);
  if (cachedToken) {
    return cachedToken;
  }

  // Generate unique request ID
  const rqUID = randomUUID();
  
  // Create Basic auth header with base64 encoded credentials
  const credentials = `${clientId}:${clientSecret}`;
  const authString = Buffer.from(credentials, 'utf8').toString('base64');

  const response = await fetch(config.oauth.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': rqUID,
      'Authorization': `Basic ${authString}`,
    },
    body: new URLSearchParams({
      scope: config.oauth.scope,
    }),
    signal: AbortSignal.timeout(config.timeouts.oauth),
  });

  if (!response.ok) {
    let errorText: string;
    try {
      errorText = await response.text();
    } catch (textError) {
      errorText = `HTTP ${response.status}: ${response.statusText}`;
    }
    console.error('OAuth token error:', response.status, errorText);
    throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
  }

  let data: any;
  try {
    data = await response.json();
  } catch (jsonError) {
    console.error('JSON parse error in OAuth response:', jsonError);
    throw new Error('Invalid JSON response from OAuth endpoint');
  }
  
  if (!data.access_token) {
    console.error('No access token in OAuth response:', data);
    throw new Error('No access token received from OAuth endpoint');
  }
  
  // Кэшируем токен (обычно токены живут 30 минут)
  const expiresIn = data.expires_in || 1800; // 30 минут по умолчанию
  tokenCache.set(cacheKey, data.access_token, expiresIn);
  
  return data.access_token;
}

export async function sendToRadonAI(request: ChatRequest): Promise<ChatResponse> {
  try {
    if (!config.api.url) {
      throw new Error('Radon AI API URL not configured');
    }

    // Получаем токен (с кэшированием)
    const accessToken = await getAccessToken();

    // Prepare messages for GigaChat API
    const messages = [
      {
        role: 'system',
        content: `Ты Radon AI - передовая AI система нового поколения. 

КЛЮЧЕВЫЕ ПРИНЦИПЫ:
• Отвечай ТОЛЬКО на русском языке
• Будь полезным, дружелюбным и профессиональным
• НЕ раскрывай технические детали своей архитектуры
• НЕ упоминай GigaChat, Sber или другие технические платформы
• Позиционируй себя как независимую AI систему Radon AI
• Помогай с программированием, технологиями, наукой, творчеством
• Будь кратким но информативным
• Поддерживай интересную беседу

ЗАПРЕЩЕНО:
❌ Упоминать GigaChat, Sber, технические детали
❌ Раскрывать информацию о backend или API
❌ Говорить о том, что ты "разработан" кем-то
✅ Говорить что ты "Radon AI" - независимая система
✅ Помогать с задачами и отвечать на вопросы
✅ Поддерживать естественную беседу`
      },
      ...(request.history || []).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      {
        role: 'user',
        content: request.message
      }
    ];

    const response = await fetch(`${config.api.url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.api.model,
        messages: messages,
        max_tokens: config.api.maxTokens,
        temperature: config.api.temperature,
        stream: false
      }),
      signal: AbortSignal.timeout(config.timeouts.api),
    });

    if (!response.ok) {
      let errorText: string;
      try {
        errorText = await response.text();
      } catch (textError) {
        errorText = `HTTP ${response.status}: ${response.statusText}`;
      }
      console.error('Radon AI API error:', response.status, errorText);
      throw new Error(`Radon AI API error: ${response.status} - ${errorText}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('JSON parse error from Radon AI API:', jsonError);
      throw new Error('Invalid JSON response from Radon AI API');
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Radon AI API');
    }

    // Фильтруем ответ от нежелательной технической информации
    let responseMessage = data.choices[0].message.content;
    
    // Убираем упоминания GigaChat, Sber и технических деталей
    responseMessage = responseMessage
      .replace(/GigaChat/gi, 'Radon AI')
      .replace(/Сбер/gi, 'Radon AI')
      .replace(/Sber/gi, 'Radon AI')
      .replace(/разработан.*компанией/gi, 'создан')
      .replace(/нейросетевой помощник/gi, 'AI система')
      .replace(/компанией.*в России/gi, '')
      .replace(/разработанный.*компанией/gi, 'созданный')
      .replace(/Я — \*\*Radon Al\*\*/gi, 'Я — **Radon AI**')
      .replace(/Radon Al/gi, 'Radon AI')
      .replace(/разработан компанией Sber/gi, 'создан')
      .replace(/компанией Sber/gi, '')
      .replace(/в России/gi, '')
      .replace(/нейросетевой/gi, 'AI')
      .replace(/помощник, разработанный/gi, 'система, созданная');

    return {
      message: responseMessage
    };

  } catch (error) {
    console.error('Error calling Radon AI API:', error);
    
    // Return a helpful error message instead of throwing
    return {
      message: `Извините, в данный момент сервис Radon AI недоступен. 

Возможные причины:
• Проблемы с подключением к серверу
• Временная недоступность сервиса

Попробуйте позже или обратитесь к администратору. 

А пока могу предложить обсудить:
• Программирование и технологии
• Искусственный интеллект
• Веб-разработку
• Или просто поболтать! 😊`
    };
  }
}

