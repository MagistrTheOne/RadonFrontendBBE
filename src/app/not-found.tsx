import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            404
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-white mb-4">
          Страница не найдена
        </h1>
        <p className="text-white/70 mb-8 leading-relaxed">
          К сожалению, запрашиваемая страница не существует или была перемещена. 
          Возможно, вы ввели неправильный адрес или перешли по устаревшей ссылке.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-all duration-200 font-medium"
          >
            <Home className="w-4 h-4" />
            На главную
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center gap-2 text-white/60 mb-2">
            <Search className="w-4 h-4" />
            <span className="text-sm">Попробуйте найти то, что вам нужно:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/chat" className="text-cyan-400 hover:text-cyan-300 text-sm">
              Чат с AI
            </Link>
            <span className="text-white/40">•</span>
            <Link href="/history" className="text-cyan-400 hover:text-cyan-300 text-sm">
              История чатов
            </Link>
            <span className="text-white/40">•</span>
            <Link href="/sign-in" className="text-cyan-400 hover:text-cyan-300 text-sm">
              Войти
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-white/40 text-sm">
          <p>Radon AI • Система искусственного интеллекта</p>
        </div>
      </div>
    </div>
  );
}
