"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Message, FileAttachment } from '@/types/chat';
import ChatArea from './ChatArea';
import ChatInput from './ChatInput';
import ChatStatusBar from './ChatStatusBar';
import FloatingNewChatButton from './FloatingNewChatButton';
import { Plus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { useKeyboardShortcuts, COMMON_SHORTCUTS } from '@/hooks/useKeyboardShortcuts';
import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts';
import QuickReplies from './QuickReplies';
import { ConnectionStatus } from '@/components/ui/OnlineIndicator';
import ChatSearch from './ChatSearch';

interface ChatContainerProps {
  onThinkingChange?: (isThinking: boolean) => void;
}

export default function ChatContainer({ onThinkingChange }: ChatContainerProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  const {
    currentChatId,
    messages,
    createNewChat,
    addMessage,
    setCurrentChat
  } = useChatStore();

  // Create new chat if none exists
  useEffect(() => {
    if (!currentChatId) {
      createNewChat().then((newChatId) => {
        setCurrentChat(newChatId);
      }).catch(console.error);
    }
  }, [currentChatId, createNewChat, setCurrentChat]);

  // Add welcome message when user is loaded and no messages
  useEffect(() => {
    if (user && messages.length === 0 && currentChatId) {
      const welcomeMessage: Message = {
        id: 'welcome',
        content: `Йоу, чем займемся? ${user.firstName || user.username || 'друг'}! 👋\n\nЯ Radon AI - ваш умный помощник. Могу помочь с любыми вопросами, обсудить технологии, помочь с кодом или просто поболтать.`,
        role: 'assistant',
        timestamp: new Date()
      };
      addMessage(welcomeMessage).catch(console.error);
      setShowQuickReplies(true);
    }
  }, [user, messages.length, currentChatId, addMessage]);

  const handleSendMessage = async (content: string, attachments?: FileAttachment[]) => {
    if ((!content.trim() && (!attachments || attachments.length === 0)) || !currentChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
      attachments: attachments,
      status: 'sending'
    };

    await addMessage(userMessage);
    setIsLoading(true);
    onThinkingChange?.(true);

    try {
      // Check for demo user
      const demoUser = localStorage.getItem('demo_user');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (demoUser) {
        headers['x-demo-user'] = demoUser;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content.trim(),
          history: messages
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'Извините, произошла ошибка при обработке запроса.',
        role: 'assistant',
        timestamp: new Date()
      };

      await addMessage(aiMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка. Попробуйте еще раз или обратитесь к администратору.',
        role: 'assistant',
        timestamp: new Date()
      };

      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
      onThinkingChange?.(false);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChatId = await createNewChat();
      await setCurrentChat(newChatId);
      setShowQuickReplies(true);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleQuickReply = (text: string) => {
    setShowQuickReplies(false);
    handleSendMessage(text);
  };

  // Клавиатурные сокращения
  const shortcuts = [
    {
      ...COMMON_SHORTCUTS.NEW_CHAT,
      action: handleNewChat
    },
    {
      ...COMMON_SHORTCUTS.SEARCH,
      action: () => setShowSearch(true)
    },
    {
      ...COMMON_SHORTCUTS.FOCUS_INPUT
    },
    {
      key: '?',
      ctrlKey: true,
      action: () => setShowShortcuts(true),
      description: 'Показать горячие клавиши'
    }
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="flex flex-col h-screen relative">
      <ConnectionStatus />
      <ChatSearch
        messages={messages}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onMessageSelect={(messageId) => {
          // TODO: Scroll to message
          console.log('Select message:', messageId);
          setShowSearch(false);
        }}
      />
      <ChatStatusBar />
      <ChatArea messages={messages} isLoading={isLoading} />
      
      {showQuickReplies && messages.length <= 1 && (
        <QuickReplies 
          onSelect={handleQuickReply}
          isVisible={showQuickReplies}
        />
      )}
      
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} chatId={currentChatId ?? undefined} />
      
      <FloatingNewChatButton />
      
      <KeyboardShortcuts
        shortcuts={shortcuts}
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
