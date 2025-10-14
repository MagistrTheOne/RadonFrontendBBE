import { ChatRequest, ChatResponse } from '@/types/chat';

const GIGACHAT_API_URL = process.env.GIGACHAT_API_URL || 'https://gigachat.devices.sberbank.ru/api/v1';
const GIGACHAT_API_TOKEN = process.env.GIGACHAT_API_TOKEN;
const GIGACHAT_CLIENT_ID = process.env.GIGACHAT_CLIENT_ID;
const GIGACHAT_CLIENT_SECRET = process.env.GIGACHAT_CLIENT_SECRET;

// Function to get access token using client credentials
async function getAccessToken(): Promise<string> {
  if (!GIGACHAT_CLIENT_ID || !GIGACHAT_CLIENT_SECRET) {
    throw new Error('GigaChat client credentials not configured');
  }

  const response = await fetch(`${GIGACHAT_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: GIGACHAT_CLIENT_ID,
      client_secret: GIGACHAT_CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('GigaChat token error:', response.status, errorText);
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function sendToGigaChat(request: ChatRequest): Promise<ChatResponse> {
  try {
    // Get access token
    const accessToken = await getAccessToken();

    // Prepare messages for GigaChat API
    const messages = [
      {
        role: 'system',
        content: 'Ты Radon AI - умный и дружелюбный ИИ-помощник. Отвечай на русском языке, будь полезным и интересным собеседником. Помогай с вопросами по программированию, технологиям, общими вопросами. Будь кратким но информативным.'
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

    const response = await fetch(`${GIGACHAT_API_URL}/chat/completions`, {
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
      console.error('GigaChat API error:', response.status, errorText);
      throw new Error(`GigaChat API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from GigaChat API');
    }

    return {
      message: data.choices[0].message.content
    };

  } catch (error) {
    console.error('Error calling GigaChat API:', error);
    
    // Fallback response for demo purposes
    return {
      message: `Привет! Я Radon AI. К сожалению, сейчас у меня проблемы с подключением к серверу, но я все равно готов помочь! 

Что бы вы хотели обсудить? Могу рассказать о:
- Программировании и технологиях
- Искусственном интеллекте
- Веб-разработке
- Или просто поболтать! 😊

(Это демо-ответ, пока настраивается интеграция с GigaChat)`
    };
  }
}

// Mock function for development/testing
export async function sendToGigaChatMock(request: ChatRequest): Promise<ChatResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const responses = [
    "Отличный вопрос! Давайте разберем это подробнее...",
    "Понимаю, что вас интересует. Вот что я могу сказать по этому поводу:",
    "Интересная тема! У меня есть несколько мыслей на этот счет:",
    "Хорошо, давайте обсудим это. Вот мой взгляд на ситуацию:",
    "Отлично! Это важный вопрос. Позвольте мне объяснить:"
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return {
    message: `${randomResponse}\n\n(Это демо-ответ от Radon AI. В реальной версии здесь будет ответ от обученной модели на H200 кластерах)`
  };
}
