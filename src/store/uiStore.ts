import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  // Sidebar state
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Status panel state
  statusPanelCollapsed: boolean;
  setStatusPanelCollapsed: (collapsed: boolean) => void;
  
  // Chat width state
  chatWidth: 'narrow' | 'wide' | 'full';
  setChatWidth: (width: 'narrow' | 'wide' | 'full') => void;
  
  // Mobile sidebar state
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  
  // Reset all UI state
  resetUIState: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Sidebar state
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      // Status panel state
      statusPanelCollapsed: false,
      setStatusPanelCollapsed: (collapsed) => set({ statusPanelCollapsed: collapsed }),
      
      // Chat width state
      chatWidth: 'wide',
      setChatWidth: (width) => set({ chatWidth: width }),
      
      // Mobile sidebar state
      mobileSidebarOpen: false,
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      
      // Reset all UI state
      resetUIState: () => set({
        sidebarCollapsed: false,
        statusPanelCollapsed: false,
        chatWidth: 'wide',
        mobileSidebarOpen: false,
      }),
    }),
    {
      name: 'radon-ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        statusPanelCollapsed: state.statusPanelCollapsed,
        chatWidth: state.chatWidth,
      }),
    }
  )
);
