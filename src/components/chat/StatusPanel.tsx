'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface StatusPanelProps {
  isThinking: boolean;
}

export default function StatusPanel({ isThinking }: StatusPanelProps) {
  const { statusPanelCollapsed, setStatusPanelCollapsed } = useUIStore();
  
  return (
    <div className="h-full glass-panel-v2 p-4 border-l border-white/10">
      {/* Collapse toggle */}
      <button 
        onClick={() => setStatusPanelCollapsed(!statusPanelCollapsed)}
        className="w-full flex items-center justify-between mb-4"
      >
        <span className="text-sm text-white/60">Статус</span>
        <ChevronRight 
          className={`w-4 h-4 transition-transform ${statusPanelCollapsed ? 'rotate-180' : ''}`}
        />
      </button>
      
      <AnimatePresence>
        {!statusPanelCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Status indicator */}
            <div className="flex items-center gap-3 mb-4">
              <div 
                className={`w-3 h-3 rounded-full ${
                  isThinking 
                    ? 'bg-purple-400 animate-pulse' 
                    : 'bg-green-400'
                }`}
              />
              <span className="text-sm text-white">
                {isThinking ? 'Radon думает...' : 'Radon готов'}
              </span>
            </div>
            
            {/* Model info */}
            <div className="text-xs text-white/40 space-y-1">
              <p>Модель: <span className="text-white/60">Radon BBE</span></p>
              <p>Режим: <span className="text-white/60">Thinking</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
