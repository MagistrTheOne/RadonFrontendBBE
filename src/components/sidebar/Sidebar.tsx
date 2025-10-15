"use client";

import { useState } from 'react';
import { Menu, X, Search, Plus, Archive, Trash2, MoreVertical, RotateCcw, Clock } from 'lucide-react';
import UserProfile from './UserProfile';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  
  const {
    createNewChat,
    setCurrentChat,
    archiveSession,
    deleteSession,
    restoreSession,
    setSearchQuery,
    getFilteredSessions,
    activeSessions,
    archivedSessions,
    currentChatId
  } = useChatStore();

  const filteredSessions = getFilteredSessions();
  const displaySessions = showArchived ? archivedSessions : filteredSessions;

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInDays = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Сегодня';
    if (diffInDays === 1) return 'Вчера';
    return `${diffInDays} дней назад`;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    setSearchQuery(query);
  };

  const handleNewChat = async () => {
    try {
      const newChatId = await createNewChat();
      await setCurrentChat(newChatId);
      onClose();
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      await setCurrentChat(sessionId);
      onClose();
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const handleArchive = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await archiveSession(sessionId);
    } catch (error) {
      console.error('Error archiving session:', error);
    }
  };

  const handleDelete = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить этот чат?')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleRestore = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await restoreSession(sessionId);
    } catch (error) {
      console.error('Error restoring session:', error);
    }
  };

  const toggleSessionMenu = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
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
      <div className="hidden lg:flex flex-col w-72 h-screen glass-panel-strong border-r border-white/10 backdrop-blur-xl shadow-2xl" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
        <SidebarContent 
          displaySessions={displaySessions}
          formatTime={formatTime}
          searchTerm={searchTerm}
          setSearchTerm={handleSearch}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          expandedSession={expandedSession}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSessionClick={handleSessionClick}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onToggleMenu={toggleSessionMenu}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-40 w-72 h-screen glass-panel-strong border-r border-white/10 backdrop-blur-xl shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <SidebarContent 
          displaySessions={displaySessions}
          formatTime={formatTime}
          searchTerm={searchTerm}
          setSearchTerm={handleSearch}
          showArchived={showArchived}
          setShowArchived={setShowArchived}
          expandedSession={expandedSession}
          currentChatId={currentChatId}
          onNewChat={handleNewChat}
          onSessionClick={handleSessionClick}
          onArchive={handleArchive}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onToggleMenu={toggleSessionMenu}
          onClose={onClose}
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
  displaySessions: any[];
  formatTime: (date: Date | string) => string;
  searchTerm: string;
  setSearchTerm: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  expandedSession: string | null;
  currentChatId: string | null;
  onNewChat: () => void;
  onSessionClick: (sessionId: string) => void;
  onArchive: (sessionId: string, e: React.MouseEvent) => void;
  onDelete: (sessionId: string, e: React.MouseEvent) => void;
  onRestore: (sessionId: string, e: React.MouseEvent) => void;
  onToggleMenu: (sessionId: string, e: React.MouseEvent) => void;
  onClose?: () => void;
}

function SidebarContent({ 
  displaySessions, 
  formatTime, 
  searchTerm, 
  setSearchTerm,
  showArchived,
  setShowArchived,
  expandedSession,
  currentChatId,
  onNewChat,
  onSessionClick,
  onArchive,
  onDelete,
  onRestore,
  onToggleMenu,
  onClose 
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
               {/* Header */}
               <div className="p-4 border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent">
                 <div className="flex items-center justify-between">
                   <h1 className="text-xl font-bold text-gray-300">Radon AI</h1>
                   <div className="flex items-center gap-2">
                     <ThemeSwitcher />
                     {onClose && (
                       <button
                         onClick={onClose}
                         className="lg:hidden p-1.5 rounded-lg glass-hover"
                         aria-label="Закрыть меню"
                       >
                         <X className="w-4 h-4 text-white" />
                       </button>
                     )}
                   </div>
                 </div>
                 <p className="text-xs text-white/60 mt-1">Ваш умный ИИ-помощник</p>
               </div>

      {/* Search */}
      <div className="p-3 border-b border-white/20 bg-gradient-to-r from-white/3 to-transparent">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <input
            type="text"
            placeholder="Поиск по истории..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b border-white/20 bg-gradient-to-r from-white/3 to-transparent">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 hover:from-cyan-500/30 hover:to-cyan-600/20 border border-cyan-500/30 rounded-lg text-gray-300 font-medium transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          Новый чат
        </button>
      </div>

      {/* Archive Toggle */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Archive className="w-3.5 h-3.5 text-white/60" />
            <span className="text-white/80 text-xs">
              {showArchived ? 'Активные чаты' : 'Архив'}
            </span>
          </div>
          <span className="text-xs text-white/40">
            {showArchived ? displaySessions.length : displaySessions.length}
          </span>
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto">
        {displaySessions.length === 0 ? (
          <div className="p-3 text-center text-white/40">
            <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">
              {showArchived ? 'Архив пуст' : 'Нет чатов'}
            </p>
          </div>
        ) : (
          <div className="p-1.5 space-y-1">
            {displaySessions.map((session) => (
              <div
                key={session.id}
                className={`
                  relative group p-2 rounded-lg cursor-pointer transition-all duration-300 backdrop-blur-sm border-l-2
                  ${currentChatId === session.id 
                    ? 'bg-gradient-to-r from-white/20 to-white/10 border-l-cyan-500 border border-white/30 shadow-lg' 
                    : 'hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 border-l-transparent hover:border-l-cyan-500/50 border border-transparent hover:border-white/20 hover:shadow-md'
                  }
                `}
                onClick={() => onSessionClick(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-white truncate">
                      {session.title}
                    </h3>
                    {session.lastMessage && (
                      <p className="text-xs text-white/60 mt-0.5 line-clamp-2">
                        {session.lastMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40">
                        {formatTime(session.timestamp)}
                      </span>
                      <span className="text-xs text-white/40">
                        {session.messageCount} сообщений
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => onToggleMenu(session.id, e)}
                      className="p-1.5 rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                    >
                      <MoreVertical className="w-4 h-4 text-white/60" />
                    </button>
                    
                    {expandedSession === session.id && (
                      <div className="absolute right-0 top-8 z-10 w-48 glass-panel-strong rounded-lg border border-white/30 py-1 shadow-2xl backdrop-blur-xl">
                        {showArchived ? (
                          <button
                            onClick={(e) => onRestore(session.id, e)}
                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 flex items-center gap-2 transition-all duration-200"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Восстановить
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => onArchive(session.id, e)}
                              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 flex items-center gap-2 transition-all duration-200"
                            >
                              <Archive className="w-4 h-4" />
                              Архивировать
                            </button>
                            <button
                              onClick={(e) => onDelete(session.id, e)}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Удалить
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Profile - moved to bottom */}
      <div className="border-t border-white/20 bg-gradient-to-r from-white/5 to-transparent">
        <UserProfile />
      </div>
    </div>
  );
}