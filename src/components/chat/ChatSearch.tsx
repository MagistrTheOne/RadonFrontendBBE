"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react';
import { Message } from '@/types/chat';

interface ChatSearchProps {
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onMessageSelect: (messageId: string) => void;
}

export default function ChatSearch({ messages, isOpen, onClose, onMessageSelect }: ChatSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Фокусируемся на поле ввода при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Поиск по сообщениям
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentIndex(0);
      return;
    }

    setIsSearching(true);
    
    const results = messages.filter(message =>
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
    setCurrentIndex(0);
    setIsSearching(false);
  }, [searchQuery, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        onMessageSelect(searchResults[currentIndex].id);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCurrentIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCurrentIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-400/30 text-yellow-200">
          {part}
        </mark>
      ) : part
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-white/20"
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Поиск по сообщениям..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/15 transition-all duration-300"
              />
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          {/* Результаты поиска */}
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 max-h-64 overflow-y-auto scrollbar-thin"
            >
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-white/60 text-sm">Поиск...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4">
                  <MessageSquare className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-white/60 text-sm">Сообщения не найдены</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                    <span>Найдено: {searchResults.length}</span>
                    <div className="flex items-center gap-1">
                      <span>Навигация:</span>
                      <kbd className="px-1 py-0.5 bg-white/10 rounded text-xs">↑↓</kbd>
                      <span>Enter</span>
                    </div>
                  </div>
                  
                  {searchResults.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onMessageSelect(message.id)}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${index === currentIndex
                          ? 'bg-cyan-500/20 border border-cyan-500/30'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`
                              text-xs font-medium
                              ${message.role === 'user' ? 'text-blue-400' : 'text-green-400'}
                            `}>
                              {message.role === 'user' ? 'Вы' : 'Radon AI'}
                            </span>
                            <span className="text-xs text-white/40">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-white line-clamp-2">
                            {highlightText(message.content, searchQuery)}
                          </p>
                        </div>
                        
                        {index === currentIndex && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 p-1 bg-cyan-500/20 rounded-full"
                          >
                            <ChevronUp className="w-3 h-3 text-cyan-400" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
