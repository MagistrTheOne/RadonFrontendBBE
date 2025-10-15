"use client";

import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
// Client-side translation loading
import { useEffect, useState } from 'react';
import ruTranslations from '../../locales/ru.json';
import enTranslations from '../../locales/en.json';
import arTranslations from '../../locales/ar.json';

export default function HeroSection() {
  const { isSignedIn, isLoaded } = useUser();
  const [locale, setLocale] = useState('ru');
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    // Get language from localStorage or browser
    const savedLocale = localStorage.getItem('radon-locale');
    const browserLang = navigator.language.toLowerCase().split('-')[0];

    const currentLocale = savedLocale || (['ru', 'en', 'ar'].includes(browserLang) ? browserLang : 'ru');
    setLocale(currentLocale);

    // Load translations from static imports
    const translationsMap = {
      ru: ruTranslations,
      en: enTranslations,
      ar: arTranslations
    };
    
    setTranslations(translationsMap[currentLocale as keyof typeof translationsMap] || ruTranslations);

    // Listen for language changes
    const handleLanguageChange = () => {
      const newLocale = localStorage.getItem('radon-locale') || 'ru';
      setLocale(newLocale);
      setTranslations(translationsMap[newLocale as keyof typeof translationsMap] || ruTranslations);
    };

    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);

  const t = (key: string) => {
    // Handle nested keys like 'items.meta_cognitive.title'
    const keys = key.split('.');
    let value = translations.hero;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main heading */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in">
          {t('title')}
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl md:text-2xl lg:text-3xl text-white/80 mb-8 animate-fade-in animation-delay-200">
          {t('subtitle')}
        </h2>

        {/* Description */}
        <p className="text-lg md:text-xl text-white/60 max-w-4xl mx-auto mb-12 leading-relaxed animate-fade-in animation-delay-400">
          {t('description')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-600">
          {isLoaded && !isSignedIn ? (
            <SignUpButton mode="modal">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl">
                {t('cta_beta')}
              </button>
            </SignUpButton>
          ) : isLoaded && isSignedIn ? (
            <button
              onClick={() => window.location.href = '/chat'}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {t('cta_chat')}
            </button>
          ) : (
            <div className="w-full sm:w-auto px-8 py-4 bg-white/20 text-white font-semibold rounded-xl animate-pulse">
              Загрузка...
            </div>
          )}

          <button
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-8 py-4 glass-panel glass-hover text-white font-semibold rounded-xl transition-all duration-200"
          >
            {t('cta_waitlist')}
          </button>
        </div>

        {/* Additional info */}
        <div className="mt-16 text-sm text-white/40 animate-fade-in animation-delay-800">
          <p>{t('stats')}</p>
        </div>
      </div>
    </section>
  );
}
