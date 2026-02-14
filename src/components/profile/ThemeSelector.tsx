import React from 'react';
import { useTheme, type ThemeName } from '@/contexts/ThemeContext';
import { Check } from 'iconoir-react';

interface ThemeOption {
  name: ThemeName;
  label: string;
  colors: { bg: string; primary: string; accent: string };
}

const THEMES: ThemeOption[] = [
  {
    name: 'oudh',
    label: 'Oudh',
    colors: {
      bg: 'hsl(40 30% 94%)',
      primary: 'hsl(160 45% 22%)',
      accent: 'hsl(68 75% 55%)',
    },
  },
  {
    name: 'khalaf',
    label: 'Khalaf',
    colors: {
      bg: 'hsl(0 0% 100%)',
      primary: 'hsl(24 85% 50%)',
      accent: 'hsl(16 80% 48%)',
    },
  },
  {
    name: 'bhukur',
    label: 'Bhukur',
    colors: {
      bg: 'hsl(0 0% 9%)',
      primary: 'hsl(24 85% 55%)',
      accent: 'hsl(30 90% 50%)',
    },
  },
];

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-3">
      {THEMES.map((t) => {
        const isActive = theme === t.name;
        return (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`relative rounded-xl border-2 p-3 transition-all ${
              isActive
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            {/* Color swatch */}
            <div className="rounded-lg overflow-hidden h-16 flex flex-col">
              <div className="flex-1" style={{ backgroundColor: t.colors.bg }} />
              <div className="h-3" style={{ backgroundColor: t.colors.primary }} />
              <div className="h-2" style={{ backgroundColor: t.colors.accent }} />
            </div>

            {/* Label */}
            <span className="block mt-2 text-sm font-medium text-foreground">{t.label}</span>

            {/* Check indicator */}
            {isActive && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
