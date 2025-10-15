"use client";

import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'auto';

interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    muted: string;
    border: string;
  };
}

const THEMES: Record<Theme, ThemeConfig> = {
  dark: {
    name: 'dark',
    displayName: 'Темная',
    colors: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#ffffff',
      secondary: '#ffffff',
      accent: '#67e8f9',
      muted: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)'
    }
  },
  light: {
    name: 'light',
    displayName: 'Светлая',
    colors: {
      background: '#fafafa',
      foreground: '#1a1a1a',
      primary: '#1a1a1a',
      secondary: '#4a4a4a',
      accent: '#0ea5e9',
      muted: 'rgba(0, 0, 0, 0.05)',
      border: 'rgba(0, 0, 0, 0.1)'
    }
  },
  auto: {
    name: 'auto',
    displayName: 'Системная',
    colors: {
      background: 'var(--background)',
      foreground: 'var(--foreground)',
      primary: 'var(--primary)',
      secondary: 'var(--secondary)',
      accent: 'var(--accent)',
      muted: 'var(--muted)',
      border: 'var(--border)'
    }
  }
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Загружаем тему из localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('radon-theme') as Theme;
    if (savedTheme && THEMES[savedTheme]) {
      setTheme(savedTheme);
    }
    setIsLoaded(true);
  }, []);

  // Применяем тему к документу
  useEffect(() => {
    if (!isLoaded) return;

    const currentTheme = THEMES[theme];
    const root = document.documentElement;

    // Устанавливаем CSS переменные
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });

    // Устанавливаем класс темы
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${theme}`);

    // Сохраняем в localStorage
    localStorage.setItem('radon-theme', theme);
  }, [theme, isLoaded]);

  // Обработка системной темы для auto режима
  useEffect(() => {
    if (theme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = document.documentElement;
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      const systemThemeConfig = THEMES[systemTheme];
      
      // Применяем системную тему
      Object.entries(systemThemeConfig.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });
      
      // Добавляем класс для системной темы
      root.classList.remove('theme-dark', 'theme-light');
      root.classList.add(`theme-${systemTheme}`);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const getCurrentTheme = () => THEMES[theme];

  return {
    theme,
    changeTheme,
    getCurrentTheme,
    isLoaded,
    availableThemes: Object.values(THEMES)
  };
}
