"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Message } from '@/types/chat';
import ChatArea from './ChatArea';
import ChatInput from './ChatInput';
import ChatStatusBar from './ChatStatusBar';
import FloatingNewChatButton from './FloatingNewChatButton';
import { Plus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

interface ChatContainerProps {
  onThinkingChange?: (isThinking: boolean) => void;
}

export default function ChatContainer({ onThinkingChange }: ChatContainerProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    currentChatId,
    messages,
    createNewChat,
    addMessage,
    setCurrentChat
  } = useChatStore();

  // Create new chat if none exists
  useEffect(() => {
    if (!currentChatId) {
      const newChatId = createNewChat();
      setCurrentChat(newChatId);
    }
  }, [currentChatId, createNewChat, setCurrentChat]);

  // Add welcome message when user is loaded and no messages
  useEffect(() => {
    if (user && messages.length === 0 && currentChatId) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Йоу, чем займемся? ${user.firstName || user.username || 'друг'}! 👋\n\nЯ Radon AI - ваш умный помощник. Могу помочь с любыми вопросами, обсудить технологии, помочь с кодом или просто поболтать.`,
        role: 'assistant',
        timestamp: new Date()
      };
      addMessage(welcomeMessage);
    }
  }, [user, messages.length, currentChatId, addMessage]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setIsLoading(true);
    onThinkingChange?.(true);

    try {
      // Check for demo user
      const demoUser = localStorage.getItem('demo_user');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (demoUser) {
        headers['x-demo-user'] = demoUser;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
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

      addMessage(aiMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка. Попробуйте еще раз или обратитесь к администратору.',
        role: 'assistant',
        timestamp: new Date()
      };

      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      onThinkingChange?.(false);
    }
  };

  const handleNewChat = () => {
    const newChatId = createNewChat();
    setCurrentChat(newChatId);
  };

  return (
    <div className="flex flex-col h-screen relative">
      <ChatStatusBar />
      <ChatArea messages={messages} isLoading={isLoading} />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      
      <FloatingNewChatButton />
    </div>
  );
}
