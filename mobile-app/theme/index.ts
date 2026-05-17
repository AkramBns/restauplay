/**
 * Theme exports for RestauPlay app
 * Centralized access to all design tokens
 */

export { ColorPalette, type ColorKey, type Theme } from './colors';
export { FontFamilies, Typography, type TypographyKey } from './typography';
export { Spacing, ComponentSpacing, type SpacingKey, type SpacingValue } from './spacing';
export { Shadows, type ShadowKey } from './shadows';

import { ColorPalette, type Theme } from './colors';
import { Typography } from './typography';
import { Spacing, ComponentSpacing } from './spacing';
import { Shadows } from './shadows';

export const Theme = {
  colors: ColorPalette,
  typography: Typography,
  spacing: Spacing,
  componentSpacing: ComponentSpacing,
  shadows: Shadows,
};

export type ThemeType = typeof Theme;