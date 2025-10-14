import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Radon Black Box Edition AI | Мета-когнитивная AI система",
  description: "Попробуйте Radon AI - часть AGI архитектуры нового поколения. Официальный пилот с ВКонтакте. Запишитесь в бета-тест.",
  keywords: ["AI", "AGI", "Meta-Cognitive AI", "Radon AI", "VK", "Beta", "Искусственный интеллект"],
  openGraph: {
    title: "Radon Black Box Edition AI",
    description: "Мета-когнитивная AI система нового поколения",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();
  const isRTL = locale === 'ar';

  return (
    <ClerkProvider>
      <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
