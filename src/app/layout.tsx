import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import SplashProvider from '@/components/splash/SplashProvider';
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
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#ffffff",
          colorBackground: "#000000",
          colorInputBackground: "#000000",
          colorInputText: "#ffffff",
        },
        elements: {
          formButtonPrimary: "bg-white text-black hover:bg-white/90",
          card: "bg-black/50 border border-white/20",
          headerTitle: "text-white",
          headerSubtitle: "text-white/70",
          socialButtonsBlockButton: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
          formFieldInput: "bg-black/50 border border-white/20 text-white",
          footerActionLink: "text-white hover:text-white/70",
        },
      }}
    >
      <html lang="ru">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
        >
          <SplashProvider>
            {children}
          </SplashProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
