import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-4 rounded-[2rem] bg-card shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 border border-border"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-6 h-6 text-foreground" />
      ) : (
        <Sun className="w-6 h-6 text-foreground" />
      )}
    </button>
  );
}
