/**
 * Hook for accessing theme values throughout the app
 * Supports both system color scheme and manual theme override
 */

import { useMemo, useContext } from 'react';
import { ColorPalette, type Theme as ThemeMode } from '@/theme/colors';
import { Typography, FontFamilies } from '@/theme/typography';
import { Spacing, ComponentSpacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeContext } from '@/context/ThemeContext';

export function useTheme() {
  const systemScheme = useColorScheme() ?? 'light';
  const themeContext = useContext(ThemeContext);

  let colorScheme = systemScheme;
  if (themeContext?.theme !== 'auto') {
    colorScheme = themeContext?.theme ?? systemScheme;
  }

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