'use client';

import { useState, useEffect } from 'react';

export function useSplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Проверяем, был ли пользователь уже на сайте
    const hasVisited = localStorage.getItem('radon-visited');
    
    if (!hasVisited) {
      // Первый визит - показываем splash screen
      setIsFirstVisit(true);
      setShowSplash(true);
      
      // Сохраняем флаг посещения
      localStorage.setItem('radon-visited', 'true');
      
      // Автоматически скрываем через 15 секунд
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 15000);
      
      return () => clearTimeout(timer);
    } else {
      // Повторный визит - не показываем splash
      setShowSplash(false);
    }
  }, []);

  const hideSplash = () => {
    setShowSplash(false);
  };

  const resetSplash = () => {
    localStorage.removeItem('radon-visited');
    setShowSplash(true);
    setIsFirstVisit(true);
  };

  return {
    showSplash,
    isFirstVisit,
    hideSplash,
    resetSplash
  };
}
