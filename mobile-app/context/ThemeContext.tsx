/**
 * Theme context for manual theme switching
 * Allows users to override system color scheme preference
 */

import React, { createContext, useState, useCallback } from 'react';
import type { Theme } from '@/theme/colors';

export interface ThemeContextType {
  theme: Theme | 'auto';
  setTheme: (theme: Theme | 'auto') => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme | 'auto';
}

export function ThemeProvider({ children, defaultTheme = 'auto' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme | 'auto'>(defaultTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === 'auto') return 'light';
      if (prev === 'light') return 'dark';
      return 'auto';
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
}