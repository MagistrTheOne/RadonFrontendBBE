"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types/chat';
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import MessageContent from './MessageContent';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  // Определяем ширину пузыря на основе длины сообщения
  const getBubbleWidth = () => {
    const length = message.content.length;
    if (length < 50) return 'max-w-[60%]';
    if (length < 150) return 'max-w-[75%]';
    if (length < 300) return 'max-w-[85%]';
    return 'max-w-[90%]';
  };

  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <motion.div 
        className={`
          ${getBubbleWidth()} rounded-2xl p-4 backdrop-blur-sm border
          ${isUser 
            ? 'glass-panel-strong ml-4' 
            : 'glass-panel mr-4'
          }
          transition-all duration-200 hover:bg-opacity-15 relative
        `}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Основной контент */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-white text-sm md:text-base">
              <MessageContent content={message.content} />
            </div>
          </div>
        </div>

        {/* Мета-информация */}
        <div className={`
          text-xs text-white/40 mt-3 flex items-center justify-between
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}>
          <span className="font-medium">
            {isUser ? 'Вы' : 'Radon AI'}
          </span>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Кнопки действий */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute top-2 flex gap-1
                ${isUser ? 'left-2' : 'right-2'}
              `}
            >
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-full glass-panel-strong hover:bg-white/20 transition-all duration-200 hover:scale-110"
                title="Копировать"
              >
                <Copy className={`w-3 h-3 ${copied ? 'text-green-400' : 'text-white/60'}`} />
              </button>
              
              {!isUser && (
                <>
                  <button
                    onClick={handleLike}
                    className="p-1.5 rounded-full glass-panel-strong hover:bg-white/20 transition-all duration-200 hover:scale-110"
                    title="Нравится"
                  >
                    <ThumbsUp className={`w-3 h-3 ${liked ? 'text-green-400' : 'text-white/60'}`} />
                  </button>
                  
                  <button
                    onClick={handleDislike}
                    className="p-1.5 rounded-full glass-panel-strong hover:bg-white/20 transition-all duration-200 hover:scale-110"
                    title="Не нравится"
                  >
                    <ThumbsDown className={`w-3 h-3 ${disliked ? 'text-red-400' : 'text-white/60'}`} />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Индикатор копирования */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full"
            >
              Скопировано!
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
