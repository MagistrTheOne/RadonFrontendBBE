'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code, HelpCircle, Lightbulb, Zap, Cpu, Wifi } from 'lucide-react';

interface GreetingCardProps {
  status?: 'training' | 'ok' | 'fallback';
  percent?: number;
  onQuickAction?: (action: string) => void;
}

export default function GreetingCard({ 
  status = 'ok', 
  percent = 100,
  onQuickAction 
}: GreetingCardProps) {
  const [selectedModel, setSelectedModel] = useState<'auto' | 'radon' | 'expert'>('auto');
  const [sarcasticMode, setSarcasticMode] = useState(false);

  const statusConfig = {
    training: {
      color: 'text-orange-400',
      icon: '🔧',
      text: 'Обучение',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    },
    ok: {
      color: 'text-gray-400',
      icon: '✅',
      text: 'Локально',
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/20'
    },
    fallback: {
      color: 'text-red-400',
      icon: '⚠️',
      text: 'Fallback',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20'
    }
  };

  const currentStatus = statusConfig[status];

  const quickActions = [
    { id: 'explain', label: 'Объясни просто', icon: HelpCircle, color: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300' },
    { id: 'code', label: 'Напиши код', icon: Code, color: 'bg-white/6 border-white/10 text-gray-200' },
    { id: 'solve', label: 'Помоги решить', icon: Lightbulb, color: 'bg-white/6 border-white/10 text-gray-200' },
    { id: 'creative', label: 'Креатив', icon: Sparkles, color: 'bg-white/6 border-white/10 text-gray-200' }
  ];

  const models = [
    { id: 'auto', label: 'Auto', icon: Zap },
    { id: 'radon', label: 'Radon', icon: Cpu },
    { id: 'expert', label: 'Expert', icon: Wifi }
  ];

  const greetings = {
    friendly: "Йоу, чем займёмся? Magistr! 👋",
    sarcastic: "Я Radon — умный, саркастичный и быстрый. Попробуй меня не напугать.",
    professional: "Radon AI — помощник по коду и знаниям. Начнём?"
  };

  const currentGreeting = sarcasticMode ? greetings.sarcastic : greetings.friendly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mx-auto max-w-4xl p-6 glass-card"
    >
      <div className="flex items-start gap-6">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent">Radon AI</h1>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatus.bg} ${currentStatus.color}`}>
              {currentStatus.icon} {currentStatus.text}
            </div>
          </div>
          
          <p className="text-sm text-gray-200 mb-4">{currentGreeting}</p>

          {/* Status bar */}
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 ${currentStatus.color} text-sm font-medium`}>
                {currentStatus.icon} {currentStatus.text}
                {status === 'training' && (
                  <span className="text-gray-400 text-xs ml-1">• {percent}%</span>
                )}
              </span>
            </div>

            {status === 'training' && (
              <div className="w-48 bg-white/6 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-orange-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3 mb-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={() => onQuickAction?.(action.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200 hover:scale-105 ${action.color}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4 inline mr-2" />
                  {action.label}
                </motion.button>
              );
            })}
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-gray-400">Модель:</span>
            <div className="flex bg-black/40 rounded-full border border-white/6 p-1">
              {models.map((model) => {
                const Icon = model.icon;
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id as any)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      isSelected 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {model.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Microcopy */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Нажми кнопку — получите шаблон ответа.</span>
            <button
              onClick={() => setSarcasticMode(!sarcasticMode)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                sarcasticMode 
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' 
                  : 'hover:bg-white/5'
              }`}
            >
              {sarcasticMode ? 'Сарказм ON' : 'Хочу сарказм?'}
            </button>
          </div>
        </div>

        {/* Right panel - metrics */}
        <div className="w-40 flex flex-col items-end">
          <div className="text-xs text-gray-400 mb-2">Model</div>
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/6">
            <div className={`w-2 h-2 rounded-full ${
              status === 'ok' ? 'bg-gray-400' : 
              status === 'training' ? 'bg-orange-400 animate-pulse' : 
              'bg-red-400'
            }`} />
            <div className="text-sm text-gray-200">RadonBBE v4.3</div>
          </div>

          <div className="text-xs text-gray-500 mb-1">Latency • GPU</div>
          <div className="text-sm text-gray-300 mb-4">~1.7 s/it • H200</div>

          {status === 'training' && (
            <div className="text-xs text-gray-500">
              <div>Loss: 0.0234</div>
              <div>Step: 1,234/5,000</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
