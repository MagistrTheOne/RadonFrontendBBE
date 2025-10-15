'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <div className="text-6xl font-bold text-red-400 mb-2">500</div>
          <div className="w-32 h-1 bg-gradient-to-r from-red-400 to-red-600 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-white mb-4">
          Внутренняя ошибка сервера вселенной.
        </h1>
        <p className="text-white/70 mb-6 leading-relaxed">
          Произошла непредвиденная ошибка. Наша команда уже работает над её устранением. Пожалуйста, попробуйте позже.
        </p>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
            <p className="text-red-400 text-sm font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-red-400/60 text-xs mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-all duration-200 font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Попробовать снова
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium"
          >
            <Home className="w-4 h-4" />
            На главную
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-white/60 text-sm mb-2">
            Если проблема повторяется, обратитесь в поддержку:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <a 
              href="mailto:support@radon-ai.com" 
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              support@radon-ai.com
            </a>
            <span className="text-white/40">•</span>
            <a 
              href="https://t.me/radon_ai_support" 
              className="text-cyan-400 hover:text-cyan-300 text-sm"
            >
              Telegram
            </a>
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
