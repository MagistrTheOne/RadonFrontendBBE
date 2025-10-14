import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Supported locales
export const locales = ['ru', 'en', 'ar'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'ru';

// Get locale from browser or fallback to default
export function getLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Try to get from localStorage first
  const savedLocale = localStorage.getItem('radon-locale') as Locale;
  if (savedLocale && locales.includes(savedLocale)) {
    return savedLocale;
  }

  // Get from browser language
  const browserLang = navigator.language.toLowerCase();
  
  // Check for exact match
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale;
  }

  // Check for language prefix (e.g., 'en-US' -> 'en')
  const langPrefix = browserLang.split('-')[0];
  if (locales.includes(langPrefix as Locale)) {
    return langPrefix as Locale;
  }

  // Check for Arabic variants
  if (browserLang.startsWith('ar')) {
    return 'ar';
  }

  // Fallback to default
  return defaultLocale;
}

// Save locale to localStorage
export function saveLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('radon-locale', locale);
  }
}

// Next-intl configuration
export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../locales/${locale}.json`)).default
  };
});
