export interface FileAttachment {
  name: string;
  size: number;
  type: string;
  url?: string;
  data?: string; // base64 data
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: FileAttachment[];
  reactions?: MessageReaction[];
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages?: Message[];
  timestamp: string;
  status: 'active' | 'archived' | 'deleted';
  lastMessage?: string | null;
  messageCount: number;
}

export interface ChatRequest {
  message: string;
  history?: Message[];
}

export interface ChatResponse {
  message: string;
  error?: string;
}
