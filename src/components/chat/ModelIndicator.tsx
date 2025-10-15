// Индикатор активной модели (пока не интегрирован)
'use client';

import { motion } from 'framer-motion';
import { Zap, Settings, Brain, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ModelType } from '@/lib/modelManager';

interface ModelIndicatorProps {
  model: ModelType;
  isActive: boolean;
  responseTime?: number;
  status?: 'idle' | 'thinking' | 'responding' | 'error';
}

interface ModelConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  name: string;
  bgColor: string;
}

export default function ModelIndicator({ 
  model, 
  isActive, 
  responseTime,
  status = 'idle'
}: ModelIndicatorProps) {
  const modelConfigs: Record<ModelType, ModelConfig> = {
    radon: { 
      icon: Zap, 
      color: 'text-cyan-400', 
      name: 'Radon',
      bgColor: 'bg-cyan-500/20'
    },
    expert: { 
      icon: Settings, 
      color: 'text-blue-400', 
      name: 'Expert',
      bgColor: 'bg-blue-500/20'
    },
    auto: { 
      icon: Brain, 
      color: 'text-purple-400', 
      name: 'Авто',
      bgColor: 'bg-purple-500/20'
    }
  };

  const config = modelConfigs[model];

  const getStatusIcon = () => {
    switch (status) {
      case 'thinking':
        return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'responding':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'thinking':
        return 'Думает...';
      case 'responding':
        return 'Отвечает';
      case 'error':
        return 'Ошибка';
      default:
        return 'Готов';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isActive ? 1 : 0.6, 
        scale: 1,
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'
      }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-full glass-panel
        ${isActive ? 'border border-white/30 shadow-lg' : 'border border-transparent'}
        transition-all duration-300
      `}
    >
      <div className="relative">
        <config.icon className={`w-4 h-4 ${config.color}`} />
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${config.bgColor}`}
          />
        )}
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/90 font-medium">{config.name}</span>
          {getStatusIcon()}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span>{getStatusText()}</span>
          {responseTime && (
            <>
              <span>•</span>
              <span>{responseTime}ms</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
