"use client";

import { motion } from 'framer-motion';
import { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isUser = message.role === 'user';

  return (
    <motion.div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.div 
        className={`
          max-w-[85%] md:max-w-[75%] lg:max-w-[65%] rounded-2xl p-4 backdrop-blur-sm border
          ${isUser 
            ? 'glass-panel-strong ml-4' 
            : 'glass-panel mr-4'
          }
          transition-all duration-200 hover:bg-opacity-15
        `}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-white leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </div>
        </div>
        <div className={`
          text-xs text-white/40 mt-3 flex items-center justify-between
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}>
          <span className="font-medium">
            {isUser ? 'Вы' : 'Radon AI'}
          </span>
          <span>{formatTime(message.timestamp)}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
