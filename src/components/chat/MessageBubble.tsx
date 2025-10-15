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
  isWelcome?: boolean;
}

export default function MessageBubble({ message, isTyping = false, isWelcome = false }: MessageBubbleProps) {
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

  // Специальная логика для welcome сообщения
  if (isWelcome) {
    return (
      <motion.div 
        className="flex justify-center items-center min-h-[40vh]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div 
          className="text-center max-w-2xl mx-auto px-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Radon AI
          </div>
          <div className="text-lg md:text-xl text-white/80 leading-relaxed">
            <MessageContent content={message.content} isTyping={isTyping} />
          </div>
        </motion.div>
      </motion.div>
    );
  }

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
            ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/15 border-blue-500/30 ml-4' 
            : 'bg-gradient-to-r from-white/10 to-white/5 border-cyan-500/20 mr-4'
          }
        `}
        whileHover={{ scale: 1.01, y: -2 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Основной контент */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="text-white text-sm md:text-base">
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
          text-xs text-white/40 mt-3 flex items-center justify-between
          ${isUser ? 'flex-row-reverse' : 'flex-row'}
        `}>
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {isUser ? 'Вы' : 'Radon AI'}
            </span>
            {isUser && message.status && (
              <div className="flex items-center">
                {message.status === 'sending' && (
                  <div className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />
                )}
                {message.status === 'sent' && (
                  <Check className="w-3 h-3 text-white/60" />
                )}
                {message.status === 'delivered' && (
                  <CheckCheck className="w-3 h-3 text-white/60" />
                )}
                {message.status === 'read' && (
                  <CheckCheck className="w-3 h-3 text-blue-400" />
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

      {/* Аватар для пользовательских сообщений */}
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <MessageAvatar role="user" size="md" />
        </div>
      )}
    </motion.div>
  );
}
