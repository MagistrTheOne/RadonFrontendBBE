"use client";

import { useState, useEffect, useCallback } from 'react';

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  preview?: string;
}

export function useClipboardHistory(maxItems: number = 20) {
  const [history, setHistory] = useState<ClipboardItem[]>([]);
  const [isSupported, setIsSupported] = useState(false);

  // Проверяем поддержку Clipboard API
  useEffect(() => {
    setIsSupported(!!navigator.clipboard && !!navigator.clipboard.read);
  }, []);

  // Загружаем историю из localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('clipboard-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const items = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(items);
      } catch (error) {
        console.error('Error loading clipboard history:', error);
      }
    }
  }, []);

  // Сохраняем историю в localStorage
  const saveHistory = useCallback((newHistory: ClipboardItem[]) => {
    localStorage.setItem('clipboard-history', JSON.stringify(newHistory));
  }, []);

  // Добавляем элемент в историю
  const addToHistory = useCallback((content: string, type: 'text' | 'image' | 'file' = 'text', preview?: string) => {
    const newItem: ClipboardItem = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      type,
      preview
    };

    setHistory(prev => {
      // Удаляем дубликаты
      const filtered = prev.filter(item => item.content !== content);
      const newHistory = [newItem, ...filtered].slice(0, maxItems);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [maxItems, saveHistory]);

  // Читаем из буфера обмена
  const readFromClipboard = useCallback(async () => {
    if (!isSupported) return null;

    try {
      const clipboardItems = await navigator.clipboard.read();
      
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type === 'text/plain') {
            const blob = await clipboardItem.getType(type);
            const text = await blob.text();
            addToHistory(text, 'text');
            return text;
          } else if (type.startsWith('image/')) {
            const blob = await clipboardItem.getType(type);
            const url = URL.createObjectURL(blob);
            addToHistory(url, 'image', url);
            return url;
          }
        }
      }
    } catch (error) {
      console.error('Error reading from clipboard:', error);
    }
    
    return null;
  }, [isSupported, addToHistory]);

  // Копируем в буфер обмена
  const copyToClipboard = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      addToHistory(content, 'text');
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }, [addToHistory]);

  // Удаляем элемент из истории
  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      saveHistory(newHistory);
      return newHistory;
    });
  }, [saveHistory]);

  // Очищаем всю историю
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('clipboard-history');
  }, []);

  // Получаем последний элемент
  const getLastItem = useCallback(() => {
    return history[0] || null;
  }, [history]);

  // Поиск по истории
  const searchHistory = useCallback((query: string) => {
    return history.filter(item => 
      item.content.toLowerCase().includes(query.toLowerCase())
    );
  }, [history]);

  return {
    history,
    isSupported,
    addToHistory,
    readFromClipboard,
    copyToClipboard,
    removeFromHistory,
    clearHistory,
    getLastItem,
    searchHistory
  };
}
