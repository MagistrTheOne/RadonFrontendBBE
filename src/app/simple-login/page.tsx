'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SimpleLogin() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Простая авторизация для демо
    if (email && name) {
      // Сохраняем в localStorage для демо
      localStorage.setItem('demo_user', JSON.stringify({ email, name }));
      router.push('/chat');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="glass-panel-strong rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Radon AI</h1>
          <p className="text-white/70">Демо-вход для тестирования</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Имя
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 glass-panel rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Введите ваше имя"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 glass-panel rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Вход...' : 'Войти в чат'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            Это демо-версия для тестирования Radon AI
          </p>
        </div>
      </div>
    </div>
  );
}
