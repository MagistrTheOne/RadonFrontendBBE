"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Code, Lightbulb, HelpCircle } from 'lucide-react';

interface QuickReply {
  id: string;
  text: string;
  icon: React.ReactNode;
  category: string;
}

interface QuickRepliesProps {
  onSelect: (text: string) => void;
  isVisible: boolean;
}

const QUICK_REPLIES: QuickReply[] = [
  {
    id: '1',
    text: 'Объясни это простыми словами',
    icon: <MessageSquare className="w-4 h-4" />,
    category: 'Объяснение'
  },
  {
    id: '2',
    text: 'Напиши код для...',
    icon: <Code className="w-4 h-4" />,
    category: 'Программирование'
  },
  {
    id: '3',
    text: 'Дай идеи для...',
    icon: <Lightbulb className="w-4 h-4" />,
    category: 'Креатив'
  },
  {
    id: '4',
    text: 'Помоги с проблемой...',
    icon: <HelpCircle className="w-4 h-4" />,
    category: 'Помощь'
  },
  {
    id: '5',
    text: 'Создай план для...',
    icon: <MessageSquare className="w-4 h-4" />,
    category: 'Планирование'
  },
  {
    id: '6',
    text: 'Анализируй данные...',
    icon: <Code className="w-4 h-4" />,
    category: 'Анализ'
  }
];

export default function QuickReplies({ onSelect, isVisible }: QuickRepliesProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="max-w-4xl mx-auto p-4 lg:p-6"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">Быстрые ответы</h3>
          <p className="text-sm text-white/60">Выберите шаблон для быстрого начала диалога</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_REPLIES.map((reply, index) => (
            <motion.button
              key={reply.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(reply.text)}
              className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  {reply.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium mb-1">{reply.text}</p>
                  <span className="text-xs text-white/50">{reply.category}</span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            Или просто начните печатать свое сообщение
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
