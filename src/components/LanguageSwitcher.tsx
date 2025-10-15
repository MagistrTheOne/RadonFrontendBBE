"use client";

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪' }
];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('ru');

  useEffect(() => {
    setMounted(true);

    // Get current locale from localStorage or browser
    const savedLocale = localStorage.getItem('radon-locale');
    const browserLang = navigator.language.toLowerCase().split('-')[0];

    const locale = savedLocale || (['ru', 'en', 'ar'].includes(browserLang) ? browserLang : 'ru');
    setCurrentLocale(locale);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (locale: string) => {
    // Save to localStorage
    localStorage.setItem('radon-locale', locale);

    // Update current locale state
    setCurrentLocale(locale);

    // Close dropdown
    setIsOpen(false);

    // Trigger re-render by updating a state that affects the UI
    window.dispatchEvent(new Event('languageChange'));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 glass-panel glass-hover rounded-lg text-white/70 hover:text-white transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLanguage.flag}</span>
        <span className="text-sm">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute bottom-full right-0 mb-2 w-48 glass-panel-strong rounded-lg border border-white/10 shadow-lg z-20">
            <div className="p-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => {
                    handleLanguageChange(language.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentLocale === language.code
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{language.flag}</span>
                  <span className="text-sm font-medium">{language.name}</span>
                  {currentLocale === language.code && (
                    <span className="ml-auto text-xs text-white/60">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
