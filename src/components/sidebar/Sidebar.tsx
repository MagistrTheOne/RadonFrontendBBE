"use client";

import { useState } from 'react';
import { Menu, X, Search, Plus } from 'lucide-react';
import UserProfile from './UserProfile';
import { useUIStore } from '@/store/uiStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatSessions] = useState([
    { id: '1', title: 'Добро пожаловать', timestamp: new Date() },
    { id: '2', title: 'Обсуждение ИИ', timestamp: new Date(Date.now() - 86400000) },
    { id: '3', title: 'Техническая архитектура', timestamp: new Date(Date.now() - 172800000) },
  ]);

  const filteredSessions = chatSessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    return `${diffInDays} дней назад`;
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-panel glass-hover"
        aria-label="Открыть меню"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-80 h-screen glass-panel border-r border-white/10">
        <SidebarContent 
          chatSessions={filteredSessions}
          formatTime={formatTime}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-40 w-80 h-screen glass-panel border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent 
          chatSessions={filteredSessions}
          formatTime={formatTime}
          onClose={onClose}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}
    </>
  );
}

interface SidebarContentProps {
  chatSessions: Array<{ id: string; title: string; timestamp: Date }>;
  formatTime: (date: Date) => string;
  onClose?: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

function SidebarContent({ chatSessions, formatTime, onClose, searchTerm, setSearchTerm }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Radon AI</h1>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg glass-hover"
              aria-label="Закрыть меню"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
        <p className="text-sm text-white/60 mt-2">Ваш умный ИИ-помощник</p>
      </div>

      {/* User Profile */}
      <UserProfile />

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Поиск по истории..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b border-white/10">
        <button
          className="w-full p-3 rounded-lg glass-panel glass-hover text-left flex items-center gap-2 transition-all duration-200 hover:bg-white/10"
        >
          <Plus className="w-4 h-4 text-white/60" />
          <span className="text-white font-medium">Новый чат</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <h2 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">
          Недавние разговоры
        </h2>
        <div className="space-y-2">
          {chatSessions.map((session) => (
            <button
              key={session.id}
              className="w-full p-3 rounded-lg glass-panel glass-hover text-left group"
            >
              <div className="text-white font-medium text-sm group-hover:text-white/90 transition-colors truncate">
                {session.title}
              </div>
              <div className="text-white/50 text-xs mt-1">
                {formatTime(session.timestamp)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40 text-center">
          Radon AI v1.0
        </div>
      </div>
    </div>
  );
}
