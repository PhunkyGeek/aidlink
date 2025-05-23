'use client';

import { useEffect, useState } from 'react';
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';

export default function ThemeSwitch() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      setTheme(systemPrefersDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', systemPrefersDark);
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="text-gray-700 dark:text-gray-300 hover:text-primary transition"
      title="Toggle theme"
    >
      {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
    </button>
  );
}
