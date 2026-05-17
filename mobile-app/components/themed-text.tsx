/**
 * ThemedText component - Text component with theme support
 * Updated to use the new modular theme system with comprehensive variants
 */

import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'default'
  | 'title'
  | 'defaultSemiBold'
  | 'subtitle'
  | 'link';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: TextVariant;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const variantStyle = getTextVariantStyle(variant || type);

  return (
    <Text
      style={[
        { color },
        variantStyle,
        getLegacyStyle(type),
        style,
      ]}
      {...rest}
    />
  );
}

function getTextVariantStyle(
  variant: TextVariant | 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'
) {
  const variantStyles: Record<string, any> = {
    displayLarge: styles.displayLarge,
    displayMedium: styles.displayMedium,
    displaySmall: styles.displaySmall,
    headlineLarge: styles.headlineLarge,
    headlineMedium: styles.headlineMedium,
    headlineSmall: styles.headlineSmall,
    titleLarge: styles.titleLarge,
    titleMedium: styles.titleMedium,
    titleSmall: styles.titleSmall,
    bodyLarge: styles.bodyLarge,
    bodyMedium: styles.bodyMedium,
    bodySmall: styles.bodySmall,
    labelLarge: styles.labelLarge,
    labelMedium: styles.labelMedium,
    labelSmall: styles.labelSmall,
  };

  return variantStyles[variant] || styles.bodyMedium;
}

function getLegacyStyle(type: ThemedTextProps['type']) {
  switch (type) {
    case 'title':
      return styles.title;
    case 'defaultSemiBold':
      return styles.defaultSemiBold;
    case 'subtitle':
      return styles.subtitle;
    case 'link':
      return styles.link;
    default:
      return styles.default;
  }
}

const styles = StyleSheet.create({
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '700',
    letterSpacing: 0,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: 0,
  },
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: 0,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: 0,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: 0,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});