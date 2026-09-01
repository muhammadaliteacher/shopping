'use client';

import { useEffect, useState } from 'react';

// Dark/light rejimni almashtirish tugmasi.
// Tanlov localStorage'da saqlanadi va <html> elementiga .dark klass qo'yiladi.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  // Server render bilan mos kelishi uchun mount bo'lgunga qadar neytral holat
  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <button
      onClick={toggle}
      title={isDark ? "Yorug' rejim" : "Qorong'i rejim"}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg
        hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
