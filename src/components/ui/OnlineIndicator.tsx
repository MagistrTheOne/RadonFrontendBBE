"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Clock } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface OnlineIndicatorProps {
  className?: string;
  showText?: boolean;
}

export default function OnlineIndicator({ className = '', showText = true }: OnlineIndicatorProps) {
  const { isOnline, lastSeen, isTyping } = useOnlineStatus();

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} дн назад`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <motion.div
          animate={{ 
            scale: isOnline ? [1, 1.2, 1] : 1,
            opacity: isOnline ? [1, 0.7, 1] : 0.5
          }}
          transition={{ 
            duration: 2, 
            repeat: isOnline ? Infinity : 0,
            ease: "easeInOut"
          }}
          className={`
            w-3 h-3 rounded-full
            ${isOnline ? 'bg-green-400' : 'bg-red-400'}
          `}
        />
        {isOnline && (
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 w-3 h-3 rounded-full bg-green-400"
          />
        )}
      </div>

      {showText && (
        <AnimatePresence mode="wait">
          {isTyping ? (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-1 text-xs text-white/60"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-1 h-1 bg-cyan-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-1 h-1 bg-cyan-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-1 h-1 bg-cyan-400 rounded-full"
              />
              <span>печатает...</span>
            </motion.div>
          ) : isOnline ? (
            <motion.span
              key="online"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-green-400"
            >
              онлайн
            </motion.span>
          ) : (
            <motion.div
              key="offline"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-1 text-xs text-red-400"
            >
              <Clock className="w-3 h-3" />
              {lastSeen ? formatLastSeen(lastSeen) : 'оффлайн'}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// Компонент для отображения статуса подключения
export function ConnectionStatus() {
  const { isOnline } = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 backdrop-blur-sm border-b border-red-400/50"
        >
          <div className="max-w-4xl mx-auto px-4 py-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <WifiOff className="w-4 h-4" />
              <span>Нет подключения к интернету</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
