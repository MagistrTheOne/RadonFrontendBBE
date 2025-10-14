import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '../lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Validate locale and fallback to default if invalid
  const validLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  const messages = (await import(`../locales/${validLocale}.json`)).default;

  return {
    locale: validLocale,
    messages
  };
});
