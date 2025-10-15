// Компонент для выбора модели (пока не интегрирован)
'use client';

import { useState } from 'react';
import { Brain, Zap, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModelType } from '@/lib/modelManager';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  disabled?: boolean;
}

interface ModelOption {
  id: ModelType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  status: 'available' | 'busy' | 'offline';
}

export default function ModelSelector({ 
  selectedModel, 
  onModelChange, 
  disabled = false 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const models: ModelOption[] = [
    {
      id: 'auto',
      name: 'Авто',
      description: 'Умный выбор модели',
      icon: Brain,
      color: 'text-purple-400',
      status: 'available'
    },
    {
      id: 'radon',
      name: 'Radon',
      description: 'Локальная модель (быстро)',
      icon: Zap,
      color: 'text-cyan-400',
      status: 'available'
    },
    {
      id: 'gigachat',
      name: 'GigaChat',
      description: 'Sber модель (мощно)',
      icon: Settings,
      color: 'text-blue-400',
      status: 'available'
    }
  ];

  const currentModel = models.find(m => m.id === selectedModel);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-400';
      case 'busy': return 'bg-yellow-400';
      case 'offline': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Доступна';
      case 'busy': return 'Занята';
      case 'offline': return 'Недоступна';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg glass-panel glass-hover 
          text-white/80 hover:text-white transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {currentModel && (
          <>
            <currentModel.icon className={`w-4 h-4 ${currentModel.color}`} />
            <span className="text-sm font-medium">{currentModel.name}</span>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(currentModel.status)}`} />
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-72 glass-panel-strong rounded-lg border border-white/20 py-2 shadow-2xl backdrop-blur-xl z-50"
          >
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                disabled={model.status === 'offline'}
                className={`
                  w-full px-4 py-3 text-left hover:bg-white/10 transition-colors
                  ${selectedModel === model.id ? 'bg-white/10' : ''}
                  ${model.status === 'offline' ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <model.icon className={`w-5 h-5 ${model.color}`} />
                    <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${getStatusColor(model.status)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-medium">{model.name}</div>
                      <div className="text-xs text-white/60">
                        {getStatusText(model.status)}
                      </div>
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {model.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            <div className="border-t border-white/10 mt-2 pt-2">
              <div className="px-4 py-2 text-xs text-white/40">
                💡 Авто-режим выбирает оптимальную модель на основе сложности запроса
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
