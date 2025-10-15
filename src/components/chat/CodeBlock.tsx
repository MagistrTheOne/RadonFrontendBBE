"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'text' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden glass-panel-strong border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
      {/* Заголовок с языком и кнопкой копирования */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/10">
        <span className="text-xs font-mono text-white/60 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <Check className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Скопировано</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Копировать</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Код */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono text-white leading-relaxed whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
