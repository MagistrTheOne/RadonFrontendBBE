"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, File, X, Calendar, User, Bot } from 'lucide-react';
import { Message, ChatSession } from '@/types/chat';

interface ChatExportProps {
  session: ChatSession;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatExport({ session, messages, isOpen, onClose }: ChatExportProps) {
  const [exportFormat, setExportFormat] = useState<'txt' | 'json'>('txt');
  const [isExporting, setIsExporting] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportAsTxt = () => {
    let content = `Чат: ${session.title}\n`;
    content += `Дата создания: ${formatTime(new Date(session.timestamp))}\n`;
    content += `Количество сообщений: ${messages.length}\n`;
    content += `${'='.repeat(50)}\n\n`;

    messages.forEach((message, index) => {
      const sender = message.role === 'user' ? 'Пользователь' : 'Radon AI';
      const timestamp = formatTime(message.timestamp);
      
      content += `[${timestamp}] ${sender}:\n`;
      content += `${message.content}\n\n`;
    });

    return content;
  };

  const exportAsJson = () => {
    const exportData = {
      session: {
        id: session.id,
        title: session.title,
        timestamp: session.timestamp,
        messageCount: messages.length
      },
      messages: messages.map(message => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        attachments: message.attachments || []
      }))
    };

    return JSON.stringify(exportData, null, 2);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      if (exportFormat === 'txt') {
        content = exportAsTxt();
        filename = `chat_${session.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
      } else {
        content = exportAsJson();
        filename = `chat_${session.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Экспорт чата</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Информация о чате */}
          <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-white/60" />
              <span className="text-sm font-medium text-white">{session.title}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Calendar className="w-3 h-3" />
              <span>{formatTime(new Date(session.timestamp))}</span>
            </div>
            <div className="text-xs text-white/60 mt-1">
              {messages.length} сообщений
            </div>
          </div>

          {/* Формат экспорта */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-3">
              Формат экспорта
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="txt"
                  checked={exportFormat === 'txt'}
                  onChange={(e) => setExportFormat(e.target.value as 'txt')}
                  className="w-4 h-4 text-cyan-500"
                />
                <FileText className="w-4 h-4 text-white/60" />
                <div>
                  <div className="text-sm text-white">Текстовый файл (.txt)</div>
                  <div className="text-xs text-white/60">Читаемый формат для печати</div>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as 'json')}
                  className="w-4 h-4 text-cyan-500"
                />
                <File className="w-4 h-4 text-white/60" />
                <div>
                  <div className="text-sm text-white">JSON файл (.json)</div>
                  <div className="text-xs text-white/60">Структурированные данные</div>
                </div>
              </label>
            </div>
          </div>

          {/* Предварительный просмотр */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Предварительный просмотр
            </label>
            <div className="p-3 bg-white/5 rounded-lg border border-white/10 max-h-32 overflow-y-auto scrollbar-thin">
              <pre className="text-xs text-white/80 whitespace-pre-wrap">
                {exportFormat === 'txt' 
                  ? exportAsTxt().substring(0, 200) + '...'
                  : exportAsJson().substring(0, 200) + '...'
                }
              </pre>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Экспорт...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Экспортировать
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
