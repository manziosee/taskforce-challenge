import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<string>(() => {
    // Check local storage first
    const savedTheme = localStorage.getItem('theme');
    // If no theme is saved, check system preference
    if (!savedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return savedTheme;
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);

    // Update document class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}