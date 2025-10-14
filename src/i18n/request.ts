import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '../lib/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  const messages = (await import(`../locales/${locale}.json`)).default;

  return {
    locale,
    messages
  };
});
