"use client";

import { Github, Linkedin, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Footer() {
  const [locale, setLocale] = useState('ru');
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    // Get language from localStorage or browser
    const savedLocale = localStorage.getItem('radon-locale');
    const browserLang = navigator.language.toLowerCase().split('-')[0];

    const currentLocale = savedLocale || (['ru', 'en', 'ar'].includes(browserLang) ? browserLang : 'ru');
    setLocale(currentLocale);

    // Load translations
    import(`../../locales/${currentLocale}.json`).then((data) => {
      setTranslations(data.default);
    });
  }, []);

  const t = (key: string) => {
    // Handle nested keys like 'items.meta_cognitive.title'
    const keys = key.split('.');
    let value = translations.footer;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <footer className="border-t border-white/10 glass-panel">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">{t('brand')}</h3>
            <p className="text-white/60 leading-relaxed">
              {t('description')}
            </p>
          </div>

          {/* Team section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('team')}</h4>
            <div className="space-y-2">
              <p className="text-white/70">{t('developer')}</p>
              <p className="text-white/60">@MagistrTheOne</p>
            </div>
          </div>

          {/* Contact section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">{t('contacts')}</h4>
            <div className="space-y-3">
              <a
                href="https://t.me/MagistrTheOne"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>@MagistrTheOne</span>
              </a>
              
              <a
                href="https://www.linkedin.com/in/magistroneai/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
              
              <a
                href="https://github.com/MagistrTheOne/RadonFrontendBBE"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-sm">
            {t('copyright')}
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-white/40 text-sm">{t('beta_version')}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
