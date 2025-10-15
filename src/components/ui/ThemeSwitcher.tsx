"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { useTheme, Theme } from '@/hooks/useTheme';

export default function ThemeSwitcher() {
  const { theme, changeTheme, availableThemes, isLoaded } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'auto':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Palette className="w-4 h-4" />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-2 rounded-lg bg-white/10 animate-pulse">
        <div className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Переключить тему"
      >
        {getThemeIcon(theme)}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-black/90 border border-white/20 rounded-lg shadow-xl backdrop-blur-sm z-50"
          >
            <div className="p-2">
              <div className="text-xs text-white/60 px-2 py-1 mb-1">Тема оформления</div>
              {availableThemes.map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => {
                    changeTheme(themeOption.name as Theme);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${theme === themeOption.name
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10'
                    }
                  `}
                >
                  {getThemeIcon(themeOption.name)}
                  <span>{themeOption.displayName}</span>
                  {theme === themeOption.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 bg-cyan-400 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay для закрытия */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
