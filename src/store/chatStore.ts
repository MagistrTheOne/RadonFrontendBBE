import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSession, Message } from '@/types/chat';

interface ChatState {
  // Current chat
  currentChatId: string | null;
  messages: Message[];
  
  // Chat sessions
  sessions: ChatSession[];
  activeSessions: ChatSession[];
  archivedSessions: ChatSession[];
  
  // Actions
  createNewChat: () => string;
  setCurrentChat: (chatId: string) => void;
  addMessage: (message: Message) => void;
  updateSession: (session: ChatSession) => void;
  archiveSession: (chatId: string) => void;
  deleteSession: (chatId: string) => void;
  restoreSession: (chatId: string) => void;
  clearCurrentChat: () => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getFilteredSessions: () => ChatSession[];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChatId: null,
      messages: [],
      sessions: [],
      activeSessions: [],
      archivedSessions: [],
      searchQuery: '',

      // Create new chat
      createNewChat: () => {
        const newChatId = `chat_${Date.now()}`;
        const newSession: ChatSession = {
          id: newChatId,
          title: 'Новый чат',
          messages: [],
          timestamp: new Date(),
          status: 'active',
          messageCount: 0
        };

        set((state) => ({
          currentChatId: newChatId,
          messages: [],
          sessions: [newSession, ...state.sessions],
          activeSessions: [newSession, ...state.activeSessions]
        }));

        return newChatId;
      },

      // Set current chat
      setCurrentChat: (chatId: string) => {
        const session = get().sessions.find(s => s.id === chatId);
        if (session) {
          set({
            currentChatId: chatId,
            messages: session.messages
          });
        }
      },

      // Add message to current chat
      addMessage: (message: Message) => {
        const { currentChatId, sessions } = get();
        if (!currentChatId) return;

        const updatedSessions = sessions.map(session => {
          if (session.id === currentChatId) {
            const updatedMessages = [...session.messages, message];
            const title = session.messages.length === 0 
              ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
              : session.title;
            
            return {
              ...session,
              messages: updatedMessages,
              title,
              lastMessage: message.content,
              messageCount: updatedMessages.length
            };
          }
          return session;
        });

        set({
          messages: [...get().messages, message],
          sessions: updatedSessions,
          activeSessions: updatedSessions.filter(s => s.status === 'active'),
          archivedSessions: updatedSessions.filter(s => s.status === 'archived')
        });
      },

      // Update session
      updateSession: (session: ChatSession) => {
        set((state) => {
          const updatedSessions = state.sessions.map(s => 
            s.id === session.id ? session : s
          );
          
          return {
            sessions: updatedSessions,
            activeSessions: updatedSessions.filter(s => s.status === 'active'),
            archivedSessions: updatedSessions.filter(s => s.status === 'archived')
          };
        });
      },

      // Archive session
      archiveSession: (chatId: string) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === chatId ? { ...session, status: 'archived' as const } : session
          );
          
          return {
            sessions: updatedSessions,
            activeSessions: updatedSessions.filter(s => s.status === 'active'),
            archivedSessions: updatedSessions.filter(s => s.status === 'archived'),
            currentChatId: state.currentChatId === chatId ? null : state.currentChatId
          };
        });
      },

      // Delete session
      deleteSession: (chatId: string) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === chatId ? { ...session, status: 'deleted' as const } : session
          );
          
          return {
            sessions: updatedSessions,
            activeSessions: updatedSessions.filter(s => s.status === 'active'),
            archivedSessions: updatedSessions.filter(s => s.status === 'archived'),
            currentChatId: state.currentChatId === chatId ? null : state.currentChatId
          };
        });
      },

      // Restore session
      restoreSession: (chatId: string) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session =>
            session.id === chatId ? { ...session, status: 'active' as const } : session
          );
          
          return {
            sessions: updatedSessions,
            activeSessions: updatedSessions.filter(s => s.status === 'active'),
            archivedSessions: updatedSessions.filter(s => s.status === 'archived')
          };
        });
      },

      // Clear current chat
      clearCurrentChat: () => {
        set({
          currentChatId: null,
          messages: []
        });
      },

      // Search
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      getFilteredSessions: () => {
        const { activeSessions, searchQuery } = get();
        if (!searchQuery.trim()) return activeSessions;
        
        return activeSessions.filter(session =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }),
    {
      name: 'radon-chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessions: state.activeSessions,
        archivedSessions: state.archivedSessions
      })
    }
  )
);