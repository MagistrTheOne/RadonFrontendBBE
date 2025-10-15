import { create } from 'zustand';
import { Message } from '@/types/chat';

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatStore {
  // State
  sessions: ChatSession[];
  currentSessionId: string | null;
  currentMessages: Message[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  createSession: (title: string) => Promise<string>;
  loadSession: (id: string) => Promise<void>;
  saveSession: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  addMessage: (message: Message) => void;
  clearError: () => void;
  setCurrentSessionId: (id: string | null) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  sessions: [],
  currentSessionId: null,
  currentMessages: [],
  isLoading: false,
  error: null,

  // Load all sessions for the current user
  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }
      const sessions = await response.json();
      set({ sessions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load sessions',
        isLoading: false 
      });
    }
  },

  // Create a new session
  createSession: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      
      const newSession = await response.json();
      set(state => ({
        sessions: [newSession, ...state.sessions],
        currentSessionId: newSession.id,
        currentMessages: [],
        isLoading: false
      }));
      
      return newSession.id;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create session',
        isLoading: false 
      });
      throw error;
    }
  },

  // Load a specific session
  loadSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/sessions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to load session');
      }
      
      const session = await response.json();
      set({
        currentSessionId: id,
        currentMessages: session.messages || [],
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load session',
        isLoading: false 
      });
    }
  },

  // Save current session
  saveSession: async () => {
    const { currentSessionId, currentMessages } = get();
    if (!currentSessionId || currentMessages.length === 0) return;

    try {
      const response = await fetch(`/api/sessions/${currentSessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save session');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to save session'
      });
    }
  },

  // Delete a session
  deleteSession: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete session');
      }
      
      set(state => ({
        sessions: state.sessions.filter(s => s.id !== id),
        currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
        currentMessages: state.currentSessionId === id ? [] : state.currentMessages,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete session',
        isLoading: false 
      });
    }
  },

  // Add a message to current session
  addMessage: (message: Message) => {
    set(state => ({
      currentMessages: [...state.currentMessages, message]
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set current session ID
  setCurrentSessionId: (id: string | null) => set({ currentSessionId: id }),
}));
