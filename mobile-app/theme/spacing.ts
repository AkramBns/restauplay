/**
 * Spacing system for RestauPlay app
 * Based on 8px base unit (modular scale)
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export type SpacingKey = keyof typeof Spacing;
export type SpacingValue = (typeof Spacing)[SpacingKey];

export const ComponentSpacing = {
  containerPadding: Spacing.lg,
  cardPadding: Spacing.lg,
  buttonPadding: { vertical: Spacing.md, horizontal: Spacing.lg },
  inputPadding: { vertical: Spacing.md, horizontal: Spacing.lg },
  listItemPadding: Spacing.lg,
  tabBarHeight: 56,
} as const;