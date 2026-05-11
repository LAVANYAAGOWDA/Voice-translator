import { languages } from '../lib/languages';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, label }) => {
  return (
    <div className="relative w-full sm:w-48 group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer font-medium"
        aria-label={label}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors">
        <ChevronDown size={18} />
      </div>
    </div>
  );
};
