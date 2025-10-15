"use client";

import { Plus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useState } from 'react';

export default function FloatingNewChatButton() {
  const { createNewChat, setCurrentChat } = useChatStore();
  const [isHovered, setIsHovered] = useState(false);

  const handleNewChat = () => {
    const newChatId = createNewChat();
    setCurrentChat(newChatId);
  };

  return (
    <button
      onClick={handleNewChat}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-2xl
        transition-all duration-300 ease-out transform
        ${isHovered 
          ? 'scale-110 shadow-cyan-500/25' 
          : 'scale-100 shadow-white/10'
        }
        bg-gradient-to-r from-cyan-500 to-blue-600
        hover:from-cyan-400 hover:to-blue-500
        border border-white/30
        backdrop-blur-xl
        shadow-2xl
        group
      `}
      aria-label="Создать новый чат"
    >
      <Plus 
        className={`
          w-6 h-6 text-white transition-transform duration-300
          ${isHovered ? 'rotate-90' : 'rotate-0'}
        `} 
      />
      
      {/* Tooltip */}
      <div className={`
        absolute right-full mr-3 top-1/2 -translate-y-1/2
        px-3 py-2 rounded-lg text-sm font-medium text-white
        bg-black/80 backdrop-blur-sm border border-white/20
        whitespace-nowrap opacity-0 group-hover:opacity-100
        transition-opacity duration-200 pointer-events-none
      `}>
        Новый чат
        <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-black/80 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
      </div>
    </button>
  );
}
