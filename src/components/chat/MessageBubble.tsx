"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/types/chat';
import { Copy, ThumbsUp, ThumbsDown, MoreHorizontal, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import MessageContent from './MessageContent';
import FileAttachment from './FileAttachment';
import MessageReactions from './MessageReactions';
import MessageAvatar from './MessageAvatar';

interface MessageBubbleProps {
  message: Message;
  isTyping?: boolean;
  isHybridMode?: boolean;
}

export default function MessageBubble({ message, isTyping = false, isHybridMode = false }: MessageBubbleProps) {
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
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group gap-3`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Аватар для AI сообщений */}
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <MessageAvatar role="assistant" size="md" />
        </div>
      )}

             <motion.div 
               className={`
                 ${getBubbleWidth()} rounded-2xl p-4 backdrop-blur-sm border
                 transition-all duration-200 hover:shadow-lg hover:border-opacity-40 relative
                 ${isUser 
                   ? 'bg-gradient-to-r from-white/5 to-white/3 border-r-3 border-r-gray-500/40 ml-4' 
                   : isHybridMode 
                     ? 'bg-gradient-to-r from-orange-500/5 to-orange-400/3 border-l-3 border-l-orange-500 mr-4'
                     : 'bg-white/3 border-l-3 border-l-cyan-500 mr-4'
                 }
               `}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Hybrid Mode Badge */}
        {isHybridMode && !isUser && (
          <div className="absolute -top-2 left-4 px-2 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs text-orange-300 font-medium">
            🤝 Hybrid mode
          </div>
        )}

        {/* Основной контент */}
        <div className="flex items-start justify-between gap-3">
                 <div className="flex-1">
                   <div className="text-gray-200 text-sm md:text-base">
                     <MessageContent content={message.content} isTyping={isTyping} />
                   </div>
            
            {/* Файловые вложения */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.attachments.map((file, index) => (
                  <FileAttachment
                    key={`${file.name}-${index}`}
                    file={file}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Мета-информация */}
        <div className={`
          text-xs text-gray-400 mt-3 flex items-center justify-between
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {isUser ? 'Вы' : 'Radon AI'}
            </span>
            {isUser && message.status && (
              <div className="flex items-center">
                {message.status === 'sending' && (
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
                {message.status === 'sent' && (
                  <Check className="w-3 h-3 text-gray-400" />
                )}
                {message.status === 'delivered' && (
                  <CheckCheck className="w-3 h-3 text-gray-400" />
                )}
                {message.status === 'read' && (
                  <CheckCheck className="w-3 h-3 text-cyan-400" />
                )}
              </div>
            )}
          </div>
          <span>{formatTime(message.timestamp)}</span>
        </div>

        {/* Реакции на сообщения */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="mt-2">
            <MessageReactions 
              reactions={message.reactions}
              onReaction={(emoji) => {
                // TODO: Implement reaction handling
                console.log('Reaction:', emoji);
              }}
            />
          </div>
        )}

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
                <Copy className={`w-3 h-3 ${copied ? 'text-green-400' : 'text-gray-400'}`} />
              </button>
              
              {!isUser && (
                <>
                  <button
                    onClick={handleLike}
                    className="p-1.5 rounded-full glass-panel-strong hover:bg-white/20 transition-all duration-200 hover:scale-110"
                    title="Нравится"
                  >
                    <ThumbsUp className={`w-3 h-3 ${liked ? 'text-green-400' : 'text-gray-400'}`} />
                  </button>
                  
                  <button
                    onClick={handleDislike}
                    className="p-1.5 rounded-full glass-panel-strong hover:bg-white/20 transition-all duration-200 hover:scale-110"
                    title="Не нравится"
                  >
                    <ThumbsDown className={`w-3 h-3 ${disliked ? 'text-red-400' : 'text-gray-400'}`} />
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

      {/* Аватар для пользовательских сообщений */}
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <MessageAvatar role="user" size="md" />
        </div>
      )}
    </motion.div>
  );
}
