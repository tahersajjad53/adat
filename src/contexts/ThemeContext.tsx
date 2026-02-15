import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type ThemeName = 'oudh' | 'khalaf' | 'bhukur';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COLORS: Record<ThemeName, string> = {
  oudh: '#ece4d4',
  khalaf: '#ffffff',
  bhukur: '#171717',
};

function applyThemeClass(theme: ThemeName) {
  const html = document.documentElement;
  html.classList.remove('theme-khalaf', 'theme-bhukur');
  if (theme === 'khalaf') html.classList.add('theme-khalaf');
  if (theme === 'bhukur') html.classList.add('theme-bhukur');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<ThemeName>('oudh');

  // Load theme from profile on login
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('theme')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        const saved = (data as any)?.theme as ThemeName | null;
        if (saved && ['oudh', 'khalaf', 'bhukur'].includes(saved)) {
          setThemeState(saved);
          applyThemeClass(saved);
        }
      });
  }, [user]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    applyThemeClass(newTheme);

    // Persist async
    if (user) {
      supabase
        .from('profiles')
        .update({ theme: newTheme, updated_at: new Date().toISOString() } as any)
        .eq('id', user.id)
        .then();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
