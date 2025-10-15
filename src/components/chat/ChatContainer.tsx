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

  // Show quick replies when user is loaded and no messages
  useEffect(() => {
    if (user && messages.length === 0 && currentChatId) {
      setShowQuickReplies(true);
    }
  }, [user, messages.length, currentChatId]);

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

      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);
      
      // Check if response contains an error
      if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(data.message || data.error);
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'Извините, произошла ошибка при обработке запроса.',
        role: 'assistant',
        timestamp: new Date()
      };

      await addMessage(aiMessage);
      
      // Update user message status to 'sent' after successful AI response
      const updatedUserMessage: Message = {
        ...userMessage,
        status: 'sent'
      };
      await addMessage(updatedUserMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Извините, произошла ошибка. Попробуйте еще раз или обратитесь к администратору.',
        role: 'assistant',
        timestamp: new Date()
      };

      addMessage(errorMessage);
      
      // Update user message status to 'delivered' even on error
      const updatedUserMessage: Message = {
        ...userMessage,
        status: 'delivered'
      };
      await addMessage(updatedUserMessage);
    } finally {
      console.log('Setting isLoading to false');
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

  const handleQuickAction = (action: string) => {
    const actionPrompts = {
      explain: "Объясни простыми словами: ",
      code: "Напиши код для: ",
      solve: "Помоги решить задачу: ",
      creative: "Помоги с креативной задачей: "
    };
    
    const prompt = actionPrompts[action as keyof typeof actionPrompts] || "";
    handleSendMessage(prompt);
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
    <div className="flex flex-col h-screen relative chat-zone">
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
      <ChatArea 
        messages={messages} 
        isLoading={isLoading} 
        onQuickAction={handleQuickAction}
      />
      
      {showQuickReplies && messages.length === 0 && (
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
