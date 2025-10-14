export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  history?: Message[];
}

export interface ChatResponse {
  message: string;
  error?: string;
}
