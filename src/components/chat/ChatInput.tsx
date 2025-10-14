"use client";

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <div className="border-t border-white/10 glass-panel">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-3 p-3 glass-panel rounded-2xl focus-within:border-white/20 transition-colors">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Ожидание ответа..." : "Введите сообщение..."}
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-white/50 resize-none outline-none min-h-[24px] max-h-[120px] py-1 disabled:opacity-50 scrollbar-thin"
            />
            
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className={`
                flex-shrink-0 p-2 rounded-lg transition-all duration-200 
                ${message.trim() && !isLoading
                  ? 'bg-white text-black hover:bg-white/90 shadow-lg' 
                  : 'bg-white/10 text-white/50 cursor-not-allowed'
                }
              `}
              aria-label="Отправить сообщение"
            >
              {isLoading ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="text-xs text-white/40 mt-2 text-center">
            Нажмите Enter для отправки, Shift + Enter для новой строки
          </div>
        </form>
      </div>
    </div>
  );
}
