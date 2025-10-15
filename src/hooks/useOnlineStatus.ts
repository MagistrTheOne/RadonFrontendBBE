"use client";

import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  lastSeen: Date | null;
  isTyping: boolean;
}

export function useOnlineStatus() {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: true,
    lastSeen: null,
    isTyping: false
  });

  // Отслеживаем онлайн статус браузера
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastSeen: null
      }));
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastSeen: new Date()
      }));
    };

    // Проверяем начальный статус
    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine
    }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Отслеживаем активность пользователя
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastSeen: null
      }));

      // Сбрасываем таймер
      clearTimeout(timeoutId);
      
      // Устанавливаем таймер для "оффлайн" через 5 минут неактивности
      timeoutId = setTimeout(() => {
        setStatus(prev => ({
          ...prev,
          isOnline: false,
          lastSeen: new Date()
        }));
      }, 5 * 60 * 1000); // 5 минут
    };

    // Слушаем различные события активности
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, []);

  const setTyping = (isTyping: boolean) => {
    setStatus(prev => ({
      ...prev,
      isTyping
    }));
  };

  const updateLastSeen = () => {
    setStatus(prev => ({
      ...prev,
      lastSeen: new Date()
    }));
  };

  return {
    ...status,
    setTyping,
    updateLastSeen
  };
}
