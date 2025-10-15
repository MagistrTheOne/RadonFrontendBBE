"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Message } from '@/types/chat';
import ChatArea from './ChatArea';
import ChatInput from './ChatInput';
import { Plus } from 'lucide-react';

interface ChatContainerProps {
  onThinkingChange?: (isThinking: boolean) => void;
}

export default function ChatContainer({ onThinkingChange }: ChatContainerProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add welcome message when user is loaded
  useEffect(() => {
    if (user && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Йоу, чем займемся? ${user.firstName || user.username || 'друг'}! 👋\n\nЯ Radon AI - ваш умный помощник. Могу помочь с любыми вопросами, обсудить технологии, помочь с кодом или просто поболтать.`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user, messages.length]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    onThinkingChange?.(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          history: messages
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'Извините, произошла ошибка при обработке запроса.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка. Попробуйте еще раз или обратитесь к администратору.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      onThinkingChange?.(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    // Add welcome message for new chat
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Йоу, чем займемся? ${user?.firstName || user?.username || 'друг'}! 👋\n\nЯ Radon AI - ваш умный помощник. Могу помочь с любыми вопросами, обсудить технологии, помочь с кодом или просто поболтать.`,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <div className="flex flex-col h-screen relative">
      <ChatArea messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      {/* Floating New Chat Button */}
      {messages.length > 1 && (
        <button
          onClick={handleNewChat}
          className="fixed top-4 right-4 z-10 p-3 rounded-full glass-panel-v2 glass-hover-v2 shadow-glow transition-all duration-200 hover:scale-105"
          title="Новый чат"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
