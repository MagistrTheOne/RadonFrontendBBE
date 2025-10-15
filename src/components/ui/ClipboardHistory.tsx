"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, Copy, Trash2, Search, X, Clock, FileText, Image, File } from 'lucide-react';
import { useClipboardHistory } from '@/hooks/useClipboardHistory';

interface ClipboardHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

export default function ClipboardHistory({ isOpen, onClose, onSelect }: ClipboardHistoryProps) {
  const { history, isSupported, copyToClipboard, removeFromHistory, clearHistory, searchHistory } = useClipboardHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState(history);

  useEffect(() => {
    if (searchQuery) {
      setFilteredHistory(searchHistory(searchQuery));
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history, searchHistory]);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'file':
        return <File className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} дн назад`;
  };

  const handleItemClick = (item: any) => {
    onSelect(item.content);
    onClose();
  };

  const handleCopy = async (e: React.MouseEvent, content: string) => {
    e.stopPropagation();
    await copyToClipboard(content);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFromHistory(id);
  };

  if (!isSupported) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <Clipboard className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Буфер обмена не поддерживается</h3>
                <p className="text-white/60 text-sm">
                  Ваш браузер не поддерживает доступ к буферу обмена.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Clipboard className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">История буфера обмена</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Поиск */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Поиск по истории..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:bg-white/15 transition-all duration-300"
              />
            </div>

            {/* История */}
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clipboard className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">
                    {searchQuery ? 'Ничего не найдено' : 'История пуста'}
                  </p>
                </div>
              ) : (
                filteredHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleItemClick(item)}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 p-1.5 bg-white/10 rounded-lg">
                          {getItemIcon(item.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-white/50">
                              {formatTime(item.timestamp)}
                            </span>
                            <span className="text-xs text-white/40 capitalize">
                              {item.type}
                            </span>
                          </div>
                          
                          <p className="text-sm text-white truncate">
                            {item.type === 'image' ? 'Изображение' : item.content}
                          </p>
                          
                          {item.type === 'image' && item.preview && (
                            <img
                              src={item.preview}
                              alt="Preview"
                              className="w-16 h-16 object-cover rounded mt-2"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleCopy(e, item.content)}
                          className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                          title="Копировать"
                        >
                          <Copy className="w-4 h-4 text-white/60" />
                        </button>
                        
                        <button
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-1.5 rounded-full hover:bg-red-500/20 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Действия */}
            {filteredHistory.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <span className="text-xs text-white/50">
                  {filteredHistory.length} элементов
                </span>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  Очистить историю
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
