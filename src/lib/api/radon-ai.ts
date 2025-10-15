import { ChatRequest, ChatResponse } from '@/types/chat';
import { randomUUID } from 'crypto';

// Отключаем проверку SSL сертификатов для корпоративных API
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const RADON_API_URL = process.env.RADON_API_URL || 'https://gigachat.devices.sberbank.ru/api/v1';
const RADON_API_TOKEN = process.env.RADON_API_TOKEN;
const RADON_CLIENT_ID = process.env.RADON_CLIENT_ID;
const RADON_CLIENT_SECRET = process.env.RADON_CLIENT_SECRET;

// Function to get access token using client credentials
async function getAccessToken(): Promise<string> {
  if (!RADON_CLIENT_ID || !RADON_CLIENT_SECRET) {
    throw new Error('Radon AI client credentials not configured');
  }

  // Generate unique request ID
  const rqUID = randomUUID();
  
  // Create Basic auth header with base64 encoded credentials
  const credentials = `${RADON_CLIENT_ID}:${RADON_CLIENT_SECRET}`;
  const authString = Buffer.from(credentials, 'utf8').toString('base64');

  const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'RqUID': rqUID,
      'Authorization': `Basic ${authString}`,
    },
    body: new URLSearchParams({
      scope: 'GIGACHAT_API_PERS',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Radon AI token error:', response.status, errorText);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function sendToRadonAI(request: ChatRequest): Promise<ChatResponse> {
  try {
    if (!RADON_API_URL) {
      throw new Error('Radon AI API URL not configured');
    }

    // Always get fresh token via OAuth (tokens expire in 30 minutes)
    console.log('Getting fresh access token via OAuth...');
    console.log('Radon AI Client ID:', RADON_CLIENT_ID);
    console.log('Radon AI Client Secret:', RADON_CLIENT_SECRET ? '***' : 'NOT SET');
    
    const accessToken = await getAccessToken();
    console.log('Access token obtained successfully');

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

    const response = await fetch(`${RADON_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat:latest',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Radon AI API error:', response.status, errorText);
      throw new Error(`Radon AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
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

