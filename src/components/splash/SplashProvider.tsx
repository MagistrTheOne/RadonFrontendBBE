'use client';

import { useState, useEffect } from 'react';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import SplashScreen from './SplashScreen';
import { useRouter } from 'next/navigation';

interface SplashProviderProps {
  children: React.ReactNode;
}

export default function SplashProvider({ children }: SplashProviderProps) {
  const { showSplash, hideSplash } = useSplashScreen();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSplashComplete = () => {
    hideSplash();
    // Перенаправляем на главную страницу после splash screen
    if (typeof window !== 'undefined') {
      router.push('/');
    }
  };

  // Не показываем splash screen во время SSR
  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {children}
    </>
  );
}
