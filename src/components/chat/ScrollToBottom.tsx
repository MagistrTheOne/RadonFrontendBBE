"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ScrollToBottomProps {
  isVisible: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export default function ScrollToBottom({ isVisible, onClick, unreadCount = 0 }: ScrollToBottomProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="fixed bottom-24 right-6 z-30 p-3 rounded-full glass-panel-strong border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 backdrop-blur-xl"
        >
          <div className="relative">
            <ChevronDown className={`w-5 h-5 text-white transition-transform duration-200 ${isHovered ? 'animate-bounce' : ''}`} />
            
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.div>
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
