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

try {
  var { useThemeMode } = require('@/context/ThemeContext');
} catch {
  var useThemeMode = undefined;
}

export function useTheme() {
  const systemScheme = useColorScheme() ?? 'light';
  
  let colorScheme = systemScheme;
  try {
    if (useThemeMode) {
      const { theme: manualTheme } = useThemeMode();
      colorScheme = manualTheme === 'auto' ? systemScheme : manualTheme;
    }
  } catch {
    // If context not available, use system scheme
    colorScheme = systemScheme;
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