import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang="ru">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
