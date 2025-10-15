'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Trash2, Search, History } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryPage() {
  const { isSignedIn, isLoaded } = useUser();
  const { sessions, loadSessions, deleteSession } = useChatStore();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isSignedIn) {
      loadSessions().finally(() => setIsLoading(false));
    }
  }, [isSignedIn, loadSessions]);
  
  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || 
      new Date(s.createdAt).toDateString() === dateFilter.toDateString();
    return matchesSearch && matchesDate;
  });
  
  const handleBulkDelete = async () => {
    for (const id of selected) {
      await deleteSession(id);
    }
    setSelected(new Set());
  };

  const groupSessionsByDate = (sessions: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Вчера';
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = 'На этой неделе';
      } else {
        groupKey = date.toLocaleDateString('ru-RU', { 
          month: 'long', 
          year: 'numeric' 
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(session);
    });
    
    return groups;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Загрузка...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Доступ запрещен</h1>
          <p className="text-white/60 mb-8">Войдите в систему для просмотра истории</p>
          <a 
            href="/sign-in" 
            className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
          >
            Войти
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Загрузка истории...</div>
      </div>
    );
  }

  const groupedSessions = groupSessionsByDate(filteredSessions);

  return (
    <div className="min-h-screen bg-black p-4 lg:p-8">
      <div className="max-w-6xl mx-auto glass-panel-v2 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <History className="w-8 h-8" />
            История чатов
          </h1>
          <p className="text-white/60">
            Управляйте своими разговорами с Radon AI
          </p>
        </motion.div>
        
        {/* Filters */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 p-3 glass-panel rounded-lg text-white placeholder-white/40"
            />
          </div>
          
          {/* Date filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="glass-panel glass-hover-v2 text-white border-white/20">
                {dateFilter ? dateFilter.toLocaleDateString('ru-RU') : 'Фильтр по дате'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="glass-panel-v2 border-white/20">
              <Calendar
                mode="single"
                selected={dateFilter}
                onSelect={setDateFilter}
                className="text-white"
              />
            </PopoverContent>
          </Popover>
          
          {/* Bulk delete */}
          {selected.size > 0 && (
            <Button 
              onClick={handleBulkDelete}
              variant="destructive"
              className="glass-panel bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить ({selected.size})
            </Button>
          )}
        </motion.div>
        
        {/* Sessions list */}
        <div className="space-y-6">
          {Object.keys(groupedSessions).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <History className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl text-white/60 mb-2">История пуста</h3>
              <p className="text-white/40">Начните новый разговор с Radon AI</p>
            </motion.div>
          ) : (
            Object.entries(groupedSessions).map(([group, items], groupIndex) => (
              <motion.div
                key={group}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <h3 className="text-lg font-semibold text-white/80 mb-3 flex items-center gap-2">
                  {group}
                  <span className="text-sm text-white/40">({items.length})</span>
                </h3>
                
                <div className="space-y-2">
                  {items.map((session, index) => (
                    <motion.div 
                      key={session.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (groupIndex * 0.1) + (index * 0.05) }}
                      className="flex items-center gap-4 p-4 glass-panel glass-hover-v2 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(session.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selected);
                          if (e.target.checked) {
                            newSelected.add(session.id);
                          } else {
                            newSelected.delete(session.id);
                          }
                          setSelected(newSelected);
                        }}
                        className="w-4 h-4 text-cyan-400 bg-transparent border-white/20 rounded"
                      />
                      
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-1">{session.title}</h4>
                        <p className="text-sm text-white/40">
                          {new Date(session.createdAt).toLocaleString('ru-RU')}
                        </p>
                        <p className="text-xs text-white/30 mt-1">
                          {session.messagesJson?.length || 0} сообщений
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => window.location.href = `/chat?session=${session.id}`}
                          variant="ghost"
                          className="glass-hover-v2 text-white border-white/20"
                        >
                          Открыть
                        </Button>
                        <Button
                          onClick={() => deleteSession(session.id)}
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500/20 border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
