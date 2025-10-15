"use client";

import { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import ScrollToBottom from './ScrollToBottom';
import GreetingCard from './GreetingCard';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onQuickAction?: (action: string) => void;
}

export default function ChatArea({ messages, isLoading, onQuickAction }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setUnreadCount(0);
  };

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom);
      
      // Подсчитываем непрочитанные сообщения
      if (!isAtBottom && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant') {
          setUnreadCount(prev => prev + 1);
        }
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const scrollElement = scrollAreaRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden chat-zone">
      <div 
        ref={scrollAreaRef}
        className="h-full overflow-y-auto p-4 lg:p-6 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30"
      >
        <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto space-y-8">
          {/* Greeting card - показываем только если нет сообщений */}
          {messages.length === 0 && (
            <div className="pt-8">
              <GreetingCard 
                status="ok" 
                percent={100}
                onQuickAction={onQuickAction}
              />
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={message.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MessageBubble 
                message={message} 
              />
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && <ThinkingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <ScrollToBottom
        isVisible={showScrollButton}
        onClick={scrollToBottom}
        unreadCount={unreadCount}
      />
    </div>
  );
}
