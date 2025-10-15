'use client';

import { useSplashScreen } from '@/hooks/useSplashScreen';
import SplashScreen from './SplashScreen';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SplashProviderProps {
  children: React.ReactNode;
}

export default function SplashProvider({ children }: SplashProviderProps) {
  const { showSplash, hideSplash } = useSplashScreen();
  const router = useRouter();

  const handleSplashComplete = () => {
    hideSplash();
    // Перенаправляем на главную страницу после splash screen
    router.push('/');
  };

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {children}
    </>
  );
}
