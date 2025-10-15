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
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  createNewChat: () => Promise<string>;
  setCurrentChat: (chatId: string) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  updateSession: (session: ChatSession) => Promise<void>;
  archiveSession: (chatId: string) => Promise<void>;
  deleteSession: (chatId: string) => Promise<void>;
  restoreSession: (chatId: string) => Promise<void>;
  clearCurrentChat: () => void;
  loadSessions: (userId: string) => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getFilteredSessions: () => ChatSession[];
}

// Helper function to get current user ID
const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try to get from Clerk (if available)
  if ((window as any).Clerk?.user?.id) {
    return (window as any).Clerk.user.id;
  }
  
  // Try to get from localStorage (demo user)
  const demoUser = localStorage.getItem('demo_user');
  if (demoUser) {
    try {
      const parsed = JSON.parse(demoUser);
      return parsed.id || 'demo-user';
    } catch {
      return 'demo-user';
    }
  }
  
  // Create a unique demo user for this session
  const sessionUserId = `demo-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const demoUserData = {
    id: sessionUserId,
    email: `${sessionUserId}@demo.com`,
    name: 'Demo User'
  };
  
  localStorage.setItem('demo_user', JSON.stringify(demoUserData));
  console.log('Created new demo user:', sessionUserId);
  
  return sessionUserId;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentChatId: null,
      messages: [],
      sessions: [],
      activeSessions: [],
      archivedSessions: [],
      isLoading: false,
      isSaving: false,
      searchQuery: '',

      // Create new chat
      createNewChat: async () => {
        const userId = getCurrentUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        set({ isSaving: true });

        try {
          const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, title: 'Новый чат' }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to create session:', response.status, errorData);
            throw new Error(`Failed to create session: ${response.status} ${errorData.error || response.statusText}`);
          }

          const newSession = await response.json();
          
          set((state) => ({
            activeSessions: [newSession, ...state.activeSessions],
            currentChatId: newSession.id,
            messages: [],
            isSaving: false,
          }));

          return newSession.id;
        } catch (error) {
          console.error('Error creating new chat:', error);
          set({ isSaving: false });
          throw error;
        }
      },

      // Set current chat
      setCurrentChat: async (chatId: string) => {
        set({ currentChatId: chatId, isLoading: true });

        try {
          await get().loadSession(chatId);
        } finally {
          set({ isLoading: false });
        }
      },

      // Add message
      addMessage: async (message: Message) => {
        const { currentChatId } = get();
        if (!currentChatId) {
          throw new Error('No active chat session');
        }

        set({ isSaving: true });

        try {
          // Временно сохраняем только локально
          console.log('Message added locally:', message);
          
          set((state) => {
            // Проверяем, что сообщение с таким ID еще не существует
            const messageExists = state.messages.some(m => m.id === message.id);
            if (messageExists) {
              console.warn('Message with ID already exists, updating instead:', message.id);
              // Обновляем существующее сообщение
              return {
                messages: state.messages.map(m => m.id === message.id ? message : m),
                isSaving: false,
              };
            }
            
            return {
              messages: [...state.messages, message],
              isSaving: false,
            };
          });
        } catch (error) {
          console.error('Error saving message:', error);
          set({ isSaving: false });
          throw error;
        }
      },

      // Update session
      updateSession: async (session: ChatSession) => {
        set({ isSaving: true });

        try {
          const response = await fetch(`/api/sessions/${session.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: session.title,
              status: session.status,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update session');
          }

          const updatedSession = await response.json();
          
          set((state) => ({
            activeSessions: state.activeSessions.map(s => 
              s.id === session.id ? updatedSession : s
            ),
            archivedSessions: state.archivedSessions.map(s => 
              s.id === session.id ? updatedSession : s
            ),
            isSaving: false,
          }));
        } catch (error) {
          console.error('Error updating session:', error);
          set({ isSaving: false });
          throw error;
        }
      },

      // Archive session
      archiveSession: async (chatId: string) => {
        set({ isSaving: true });

        try {
          const response = await fetch(`/api/sessions/${chatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' }),
          });

          if (!response.ok) {
            throw new Error('Failed to archive session');
          }

          set((state) => {
            const session = state.activeSessions.find(s => s.id === chatId);
            if (session) {
              return {
                activeSessions: state.activeSessions.filter(s => s.id !== chatId),
                archivedSessions: [{ ...session, status: 'archived' as const }, ...state.archivedSessions],
                isSaving: false,
              };
            }
            return { isSaving: false };
          });
        } catch (error) {
          console.error('Error archiving session:', error);
          set({ isSaving: false });
          throw error;
        }
      },

      // Delete session
      deleteSession: async (chatId: string) => {
        set({ isSaving: true });

        try {
          const response = await fetch(`/api/sessions/${chatId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete session');
          }

          set((state) => ({
            activeSessions: state.activeSessions.filter(s => s.id !== chatId),
            archivedSessions: state.archivedSessions.filter(s => s.id !== chatId),
            currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
            messages: state.currentChatId === chatId ? [] : state.messages,
            isSaving: false,
          }));
        } catch (error) {
          console.error('Error deleting session:', error);
          set({ isSaving: false });
          throw error;
        }
      },

      // Restore session
      restoreSession: async (chatId: string) => {
        set({ isSaving: true });

        try {
          const response = await fetch(`/api/sessions/${chatId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' }),
          });

          if (!response.ok) {
            throw new Error('Failed to restore session');
          }

          set((state) => {
            const session = state.archivedSessions.find(s => s.id === chatId);
            if (session) {
              return {
                activeSessions: [{ ...session, status: 'active' as const }, ...state.activeSessions],
                archivedSessions: state.archivedSessions.filter(s => s.id !== chatId),
                isSaving: false,
              };
            }
            return { isSaving: false };
          });
        } catch (error) {
          console.error('Error restoring session:', error);
          set({ isSaving: false });
          throw error;
        }
      },

      // Clear current chat
      clearCurrentChat: () => {
        set({ currentChatId: null, messages: [] });
      },

      // Load sessions
      loadSessions: async (userId: string) => {
        set({ isLoading: true });

        try {
          const [activeResponse, archivedResponse] = await Promise.all([
            fetch(`/api/sessions?userId=${userId}&status=active`),
            fetch(`/api/sessions?userId=${userId}&status=archived`),
          ]);

          if (!activeResponse.ok || !archivedResponse.ok) {
            throw new Error('Failed to load sessions');
          }

          const activeSessions = await activeResponse.json();
          const archivedSessions = await archivedResponse.json();

          set({
            activeSessions,
            archivedSessions,
            sessions: [...activeSessions, ...archivedSessions],
            isLoading: false,
          });
        } catch (error) {
          console.error('Error loading sessions:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Load session with messages
      loadSession: async (sessionId: string) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`/api/sessions/${sessionId}`);

          if (!response.ok) {
            throw new Error('Failed to load session');
          }

          const sessionData = await response.json();
          
          set({
            messages: sessionData.messages || [],
            isLoading: false,
          });
        } catch (error) {
          console.error('Error loading session:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Search
      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      getFilteredSessions: () => {
        const { sessions, searchQuery } = get();
        if (!searchQuery.trim()) return sessions;
        
        return sessions.filter(session =>
          session.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        currentChatId: state.currentChatId,
        searchQuery: state.searchQuery,
      }),
    }
  )
);
