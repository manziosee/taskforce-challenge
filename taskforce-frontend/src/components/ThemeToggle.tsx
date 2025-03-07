import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:scale-110"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-500 animate-scale-in" />
      ) : (
        <Moon className="w-5 h-5 text-primary-600 animate-scale-in" />
      )}
    </button>
  );
}