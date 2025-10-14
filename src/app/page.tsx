"use client";

import { useState } from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/nextjs';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatContainer from '@/components/chat/ChatContainer';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Show loading state while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  // Show sign-in page if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-8 max-w-md mx-auto p-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">Radon AI</h1>
            <p className="text-white/60 text-lg">Ваш умный ИИ-помощник</p>
          </div>
          
          <div className="space-y-4">
            <SignInButton mode="modal">
              <button className="w-full p-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors">
                Войти
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="w-full p-3 rounded-lg glass-panel glass-hover text-white font-medium">
                Зарегистрироваться
              </button>
            </SignUpButton>
          </div>
          
          <p className="text-white/40 text-sm">
            Войдите, чтобы начать общение с Radon AI
          </p>
        </div>
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
      />
      
      <div className="flex-1 lg:ml-0">
        <ChatContainer />
      </div>
    </div>
  );
}
