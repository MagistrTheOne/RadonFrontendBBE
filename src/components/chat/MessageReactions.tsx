"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Heart, ThumbsUp, Laugh, Angry, Frown } from 'lucide-react';

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

interface MessageReactionsProps {
  reactions?: MessageReaction[];
  onReaction?: (emoji: string) => void;
  currentUserId?: string;
}

const REACTION_EMOJIS = [
  { emoji: '👍', icon: ThumbsUp, label: 'Нравится' },
  { emoji: '❤️', icon: Heart, label: 'Любовь' },
  { emoji: '😂', icon: Laugh, label: 'Смех' },
  { emoji: '😢', icon: Frown, label: 'Грусть' },
  { emoji: '😡', icon: Angry, label: 'Злость' },
  { emoji: '😮', icon: Smile, label: 'Удивление' },
];

export default function MessageReactions({ 
  reactions = [], 
  onReaction, 
  currentUserId 
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReaction = (emoji: string) => {
    onReaction?.(emoji);
    setShowPicker(false);
  };

  const hasUserReacted = (reaction: MessageReaction) => {
    return currentUserId && reaction.users.includes(currentUserId);
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      {/* Существующие реакции */}
      {reactions.map((reaction, index) => (
        <motion.button
          key={reaction.emoji}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleReaction(reaction.emoji)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200
            ${hasUserReacted(reaction) 
              ? 'bg-cyan-500/20 border border-cyan-500/30' 
              : 'bg-white/10 border border-white/20 hover:bg-white/20'
            }
          `}
        >
          <span className="text-sm">{reaction.emoji}</span>
          <span className="text-white/80 font-medium">{reaction.count}</span>
        </motion.button>
      ))}

      {/* Кнопка добавления реакции */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowPicker(!showPicker)}
        className="p-1 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
      >
        <Smile className="w-3 h-3 text-white/60" />
      </motion.button>

      {/* Picker реакций */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-full left-0 mb-2 p-2 bg-black/90 border border-white/20 rounded-lg shadow-xl backdrop-blur-sm z-10"
          >
            <div className="flex gap-1">
              {REACTION_EMOJIS.map(({ emoji, icon: Icon, label }) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleReaction(emoji)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  title={label}
                >
                  <span className="text-lg">{emoji}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
