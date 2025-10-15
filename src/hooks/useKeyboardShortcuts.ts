"use client";

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(({ key, ctrlKey, shiftKey, altKey, metaKey, action }) => {
      const isCtrl = ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const isShift = shiftKey ? event.shiftKey : !event.shiftKey;
      const isAlt = altKey ? event.altKey : !event.altKey;
      const isMeta = metaKey ? event.metaKey : !event.metaKey;
      
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        isCtrl &&
        isShift &&
        isAlt &&
        isMeta
      ) {
        event.preventDefault();
        action();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Предустановленные сокращения
export const COMMON_SHORTCUTS = {
  NEW_CHAT: {
    key: 'n',
    ctrlKey: true,
    action: () => {
      // Будет переопределено в компоненте
    },
    description: 'Новый чат'
  },
  SEARCH: {
    key: 'k',
    ctrlKey: true,
    action: () => {
      // Будет переопределено в компоненте
    },
    description: 'Поиск'
  },
  FOCUS_INPUT: {
    key: 'l',
    ctrlKey: true,
    action: () => {
      const input = document.querySelector('textarea[placeholder*="сообщение"]') as HTMLTextAreaElement;
      input?.focus();
    },
    description: 'Фокус на поле ввода'
  },
  ESCAPE: {
    key: 'Escape',
    action: () => {
      // Закрыть модальные окна, выйти из режима редактирования
      const modals = document.querySelectorAll('[data-modal]');
      modals.forEach(modal => {
        if (modal instanceof HTMLElement) {
          modal.style.display = 'none';
        }
      });
    },
    description: 'Закрыть/отмена'
  }
};
