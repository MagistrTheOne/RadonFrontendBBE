"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from './FileUpload';
import { FileAttachment } from '@/types/chat';
import { useDraftAutosave } from '@/hooks/useDraftAutosave';
import ClipboardHistory from '@/components/ui/ClipboardHistory';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: FileAttachment[]) => void;
  isLoading: boolean;
  chatId?: string;
}

export default function ChatInput({ onSendMessage, isLoading, chatId }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showClipboardHistory, setShowClipboardHistory] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Автосохранение черновиков
  const { draft, isSaving, updateDraft, clearDraft, hasUnsavedChanges, getLastSavedTime } = useDraftAutosave(chatId || 'default');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
      clearDraft(); // Очищаем черновик после отправки
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileUpload = (files: File[]) => {
    const newAttachments: FileAttachment[] = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      data: URL.createObjectURL(file) // В реальном приложении здесь будет base64 или загрузка на сервер
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Загружаем черновик при инициализации
  useEffect(() => {
    if (draft.message) {
      setMessage(draft.message);
    }
    if (draft.attachments) {
      setAttachments(draft.attachments);
    }
  }, [draft]);

  // Автосохранение при изменении сообщения или файлов
  useEffect(() => {
    if (hasUnsavedChanges(message, attachments)) {
      const cleanup = updateDraft(message, attachments);
      return cleanup;
    }
  }, [message, attachments, updateDraft, hasUnsavedChanges]);

  return (
    <div className="border-t border-white/10 glass-panel">
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Прикрепленные файлы */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-2"
            >
              {attachments.map((attachment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-white/60" />
                    <span className="text-sm text-white truncate">{attachment.name}</span>
                    <span className="text-xs text-white/50">({Math.round(attachment.size / 1024)}KB)</span>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-3 p-3 glass-card focus-within:border-cyan-500/30 transition-colors">
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-cyan-500/20 transition-colors"
              aria-label="Прикрепить файл"
            >
              <Paperclip className="w-5 h-5 text-white/60" />
            </button>

            <button
              type="button"
              onClick={() => setShowClipboardHistory(true)}
              className="flex-shrink-0 p-2 rounded-lg bg-white/10 hover:bg-cyan-500/20 transition-colors"
              aria-label="История буфера обмена"
            >
              <Clipboard className="w-5 h-5 text-white/60" />
            </button>

            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Ожидание ответа..." : "Введите сообщение..."}
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 resize-none outline-none min-h-[24px] max-h-[120px] py-1 disabled:opacity-50 scrollbar-thin"
            />
            
            <button
              type="submit"
              disabled={(!message.trim() && attachments.length === 0) || isLoading}
              className={`
                flex-shrink-0 p-2 rounded-lg transition-all duration-200 
                ${(message.trim() || attachments.length > 0) && !isLoading
                  ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg hover:shadow-cyan-500/25' 
                  : 'bg-white/10 text-gray-400 cursor-not-allowed'
                }
              `}
              aria-label="Отправить сообщение"
            >
              {isLoading ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500">
              Нажмите Enter для отправки, Shift + Enter для новой строки
            </div>
            {isSaving && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                Сохранение...
              </div>
            )}
            {!isSaving && hasUnsavedChanges(message, attachments) && (
              <div className="text-xs text-gray-400">
                Несохраненные изменения
              </div>
            )}
          </div>
        </form>

        {/* File Upload Modal */}
        <AnimatePresence>
          {showFileUpload && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4"
            >
              <FileUpload onFileUpload={handleFileUpload} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clipboard History Modal */}
        <ClipboardHistory
          isOpen={showClipboardHistory}
          onClose={() => setShowClipboardHistory(false)}
          onSelect={(content) => {
            setMessage(content);
            setShowClipboardHistory(false);
          }}
        />
      </div>
    </div>
  );
}
