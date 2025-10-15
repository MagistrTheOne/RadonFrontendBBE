'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  const phases = [
    { text: 'Инициализация Radon AI...', duration: 3000 },
    { text: 'Подключение к нейросетям...', duration: 4000 },
    { text: 'Загрузка языковых моделей...', duration: 3000 },
    { text: 'Готов к работе!', duration: 2000 },
    { text: 'Добро пожаловать в будущее', duration: 3000 }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    const interval = 50; // Обновляем каждые 50мс
    const increment = (interval / totalDuration) * 100;

    // Разрешаем пропуск через 3 секунды
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 3000);

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => {
      clearInterval(timer);
      clearTimeout(skipTimer);
    };
  }, [onComplete, isClient]);

  useEffect(() => {
    if (!isClient) return;

    let currentTime = 0;
    const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0);
    
    phases.forEach((phase, index) => {
      setTimeout(() => {
        setCurrentPhase(index);
      }, currentTime);
      currentTime += phase.duration;
    });
  }, [isClient]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-black to-purple-900/20" />
        
        {/* Floating particles */}
        {isClient && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                  opacity: 0
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}

        {/* Main content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-8">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-white">RAI</span>
              </motion.div>
              <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
                  Radon
                </h1>
                <p className="text-xl text-gray-300">AI System</p>
              </div>
            </div>
          </motion.div>

          {/* Collaboration text */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center gap-3 text-lg text-gray-300">
              <span>Radon (RAI)</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-cyan-400"
              >
                ×
              </motion.span>
              <span>VK</span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Powered by <span className="text-cyan-400 font-semibold">MagistrTheOne</span> | Father
            </p>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="mt-4 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
            />
          </motion.div>

          {/* Status text */}
          <motion.div
            key={currentPhase}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <p className="text-xl text-white font-medium">
              {phases[currentPhase]?.text}
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="w-full max-w-md mx-auto bg-gray-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {Math.round(progress)}%
            </p>
          </div>

          {/* Year badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full"
          >
            <span className="text-cyan-400 font-semibold">AI</span>
            <span className="text-gray-300">|</span>
            <span className="text-white">Коллаб года</span>
            <span className="text-cyan-400 font-bold">2025</span>
          </motion.div>
        </div>

        {/* Skip button */}
        {canSkip && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="absolute bottom-8 right-8 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-all duration-300 backdrop-blur-sm"
          >
            Пропустить
          </motion.button>
        )}

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </motion.div>
    </AnimatePresence>
  );
}
