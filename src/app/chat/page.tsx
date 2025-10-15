"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Sidebar from '@/components/sidebar/Sidebar';
import ChatContainer from '@/components/chat/ChatContainer';
import StatusPanel from '@/components/chat/StatusPanel';
import { useUIStore } from '@/store/uiStore';

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const { statusPanelCollapsed } = useUIStore();

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
            <button 
              onClick={() => window.location.href = '/sign-in'}
              className="w-full p-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Войти
            </button>
            
            <button 
              onClick={() => window.location.href = '/sign-up'}
              className="w-full p-3 rounded-lg glass-panel glass-hover text-white font-medium"
            >
              Зарегистрироваться
            </button>
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
    <div className="flex h-screen bg-black">
      {/* Sidebar: фиксированная ширина */}
      <div className="hidden lg:block">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          onToggle={toggleSidebar}
        />
      </div>
      
      {/* Chat Container: занимает оставшееся место */}
      <div className="flex-1 flex flex-col">
        <ChatContainer onThinkingChange={setIsThinking} />
      </div>
      
      {/* Status Panel: фиксированная ширина, скрывается при сворачивании */}
      <div className={`hidden xl:block transition-all duration-300 ${
        statusPanelCollapsed ? 'w-0 overflow-hidden' : 'w-80'
      }`}>
        <StatusPanel isThinking={isThinking} />
      </div>
    </div>
  );
}
