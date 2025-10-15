"use client";

import { useChatStore } from '@/store/chatStore';
import { MessageCircle, Clock, Archive, Download } from 'lucide-react';
import OnlineIndicator from '@/components/ui/OnlineIndicator';
import ChatExport from './ChatExport';
import { useState } from 'react';

export default function ChatStatusBar() {
  const { currentChatId, messages, activeSessions, archivedSessions } = useChatStore();
  const [showExport, setShowExport] = useState(false);
  
  const currentSession = activeSessions.find(s => s.id === currentChatId) || 
                        archivedSessions.find(s => s.id === currentChatId);
  
  if (!currentSession) return null;

  return (
    <>
      <div className="border-b border-white/10 glass-card">
        <div className="max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto px-4 lg:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-200">
                  {currentSession.title}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>
                  {currentSession.messageCount} сообщений
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <OnlineIndicator showText={false} />
              
              <button
                onClick={() => setShowExport(true)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-cyan-500/20 transition-colors"
                title="Экспорт чата"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
              
              {currentSession.status === 'archived' && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                  <Archive className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-400">Архив</span>
                </div>
              )}
              
              <div className="text-xs text-gray-400">
                {new Date(currentSession.timestamp).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ChatExport
        session={currentSession}
        messages={messages}
        isOpen={showExport}
        onClose={() => setShowExport(false)}
      />
    </>
  );
}
