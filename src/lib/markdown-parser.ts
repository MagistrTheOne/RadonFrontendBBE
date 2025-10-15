// Простой парсер markdown для чата
export function parseMarkdown(text: string): string {
  if (!text) return '';

  let parsed = text;

  // Обрабатываем жирный текст **text** или __text__ (приоритет над курсивом)
  parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Обрабатываем зачеркнутый текст ~~text~~
  parsed = parsed.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // Обрабатываем inline код `code` (приоритет над курсивом)
  parsed = parsed.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Обрабатываем курсив *text* или _text_ (после обработки жирного и кода)
  parsed = parsed.replace(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  parsed = parsed.replace(/(?<!_)_(?!_)([^_\n]+)_(?!_)/g, '<em>$1</em>');

  // Обрабатываем ссылки [text](url)
  parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">$1</a>');

  // Обрабатываем заголовки ### text
  parsed = parsed.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>');
  parsed = parsed.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold text-white mt-4 mb-2">$1</h2>');
  parsed = parsed.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mt-4 mb-2">$1</h1>');

  // Обрабатываем списки
  // Заменяем строки, начинающиеся с -, *, + на <li>
  parsed = parsed.replace(/^[ \t]*[-*+] (.*)$/gm, '<li class="text-white ml-4">$1</li>');

  

  // Обрабатываем переносы строк (после обработки заголовков и списков)
  parsed = parsed.replace(/\n/g, '<br>');

  return parsed;
}

// Функция для безопасного рендеринга HTML
export function createMarkup(htmlString: string) {
  return { __html: htmlString };
}
