"use client";

import { useState, useEffect, useCallback } from 'react';

interface DraftData {
  message: string;
  attachments?: any[];
  timestamp: number;
}

export function useDraftAutosave(chatId: string, delay: number = 1000) {
  const [draft, setDraft] = useState<DraftData>({ message: '', timestamp: 0 });
  const [isSaving, setIsSaving] = useState(false);

  // Загружаем черновик при инициализации
  useEffect(() => {
    const savedDraft = localStorage.getItem(`draft_${chatId}`);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setDraft(parsedDraft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [chatId]);

  // Сохраняем черновик в localStorage
  const saveDraft = useCallback((message: string, attachments?: any[]) => {
    const draftData: DraftData = {
      message,
      attachments,
      timestamp: Date.now()
    };
    
    setIsSaving(true);
    localStorage.setItem(`draft_${chatId}`, JSON.stringify(draftData));
    setDraft(draftData);
    
    // Имитируем задержку сохранения
    setTimeout(() => setIsSaving(false), 300);
  }, [chatId]);

  // Очищаем черновик
  const clearDraft = useCallback(() => {
    localStorage.removeItem(`draft_${chatId}`);
    setDraft({ message: '', timestamp: 0 });
  }, [chatId]);

  // Автосохранение с задержкой
  const updateDraft = useCallback((message: string, attachments?: any[]) => {
    const timeoutId = setTimeout(() => {
      if (message.trim() || (attachments && attachments.length > 0)) {
        saveDraft(message, attachments);
      } else {
        clearDraft();
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [saveDraft, clearDraft, delay]);

  // Проверяем, есть ли несохраненные изменения
  const hasUnsavedChanges = useCallback((currentMessage: string, currentAttachments?: any[]) => {
    return currentMessage !== draft.message || 
           JSON.stringify(currentAttachments) !== JSON.stringify(draft.attachments);
  }, [draft]);

  // Получаем время последнего сохранения
  const getLastSavedTime = useCallback(() => {
    return draft.timestamp ? new Date(draft.timestamp) : null;
  }, [draft.timestamp]);

  return {
    draft,
    isSaving,
    updateDraft,
    clearDraft,
    hasUnsavedChanges,
    getLastSavedTime
  };
}
