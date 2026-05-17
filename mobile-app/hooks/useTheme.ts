/**
 * Hook for accessing theme values throughout the app
 * Supports both system color scheme and manual theme override
 */

import { useMemo } from 'react';
import { ColorPalette, type Theme as ThemeMode } from '@/theme/colors';
import { Typography, FontFamilies } from '@/theme/typography';
import { Spacing, ComponentSpacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeMode } from '@/context/ThemeContext';

export function useTheme() {
  const systemScheme = useColorScheme() ?? 'light';
  const { theme: manualTheme } = useThemeMode();

  const colorScheme = manualTheme === 'auto' ? systemScheme : manualTheme;

  return useMemo(
    () => ({
      isDark: colorScheme === 'dark',
      colors: ColorPalette[colorScheme as ThemeMode],
      typography: Typography,
      spacing: Spacing,
      componentSpacing: ComponentSpacing,
      shadows: Shadows,
      fontFamilies: FontFamilies,
    }),
    [colorScheme]
  );
}