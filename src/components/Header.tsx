import { Globe2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Header = () => {
  return (
    <header className="w-full flex items-center justify-between py-6 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <Globe2 size={24} />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
          LingoAI
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
};
