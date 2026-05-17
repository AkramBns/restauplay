/**
 * Hook for accessing theme values throughout the app
 * Provides consistent access to colors, typography, spacing, and shadows
 */

import { useMemo } from 'react';
import { ColorPalette, type Theme as ThemeMode } from '@/theme/colors';
import { Typography, FontFamilies } from '@/theme/typography';
import { Spacing, ComponentSpacing } from '@/theme/spacing';
import { Shadows } from '@/theme/shadows';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const colorScheme = useColorScheme() ?? 'light';

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