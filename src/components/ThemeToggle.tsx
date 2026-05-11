import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white/20 hover:bg-white/30 dark:bg-gray-800/50 dark:hover:bg-gray-800 backdrop-blur-md transition-all shadow-sm"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="text-yellow-400" size={20} />
      ) : (
        <Moon className="text-indigo-900" size={20} />
      )}
    </button>
  );
};
