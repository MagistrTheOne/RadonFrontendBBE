import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '../lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Always use defaultLocale for now to avoid 404 errors
  const validLocale = defaultLocale;

  const messages = (await import(`../locales/${validLocale}.json`)).default;

  return {
    locale: validLocale,
    messages
  };
});
