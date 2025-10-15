"use client";

import { useState } from 'react';
import CodeBlock from './CodeBlock';
import { parseMarkdown, createMarkup } from '@/lib/markdown-parser';
import TypingAnimation from './TypingAnimation';

interface MessageContentProps {
  content: string;
  isTyping?: boolean;
  typingSpeed?: number;
}

export default function MessageContent({ content, isTyping = false, typingSpeed = 30 }: MessageContentProps) {
  const [expandedCode, setExpandedCode] = useState<number | null>(null);

  // Функция для разбора текста и выделения кода
  const parseContent = (text: string) => {
    const parts: Array<{ type: 'text' | 'code' | 'inline-code'; content: string; language?: string }> = [];
    let currentIndex = 0;

    // Регулярные выражения для поиска блоков кода
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;

    let match;
    let lastIndex = 0;

    // Сначала обрабатываем блоки кода
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Добавляем текст до блока кода
      if (match.index > lastIndex) {
        const textBefore = text.slice(lastIndex, match.index);
        if (textBefore.trim()) {
          parts.push({ type: 'text', content: textBefore });
        }
      }

      // Добавляем блок кода
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'text'
      });

      lastIndex = match.index + match[0].length;
    }

    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({ type: 'text', content: remainingText });
      }
    }

    // Если не было блоков кода, обрабатываем весь текст для inline кода
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }

    return parts;
  };

  const renderTextWithMarkdown = (text: string) => {
    // Сначала обрабатываем блоки кода, чтобы не трогать markdown внутри них
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks: string[] = [];
    let processedText = text.replace(codeBlockRegex, (match, index) => {
      codeBlocks.push(match);
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Парсим markdown для остального текста
    const parsedMarkdown = parseMarkdown(processedText);

    // Восстанавливаем блоки кода
    const finalText = parsedMarkdown.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
      return codeBlocks[parseInt(index)];
    });

    return finalText;
  };

  const parts = parseContent(content);

  if (isTyping) {
    return (
      <div className="prose prose-invert max-w-none">
        <TypingAnimation 
          text={content} 
          speed={typingSpeed}
          className="text-white"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock
              key={index}
              code={part.content}
              language={part.language}
            />
          );
        } else if (part.type === 'text') {
          return (
            <div 
              key={index} 
              className="leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={createMarkup(renderTextWithMarkdown(part.content))}
            />
          );
        }
        return null;
      })}
    </div>
  );
}
