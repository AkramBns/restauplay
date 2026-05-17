/**
 * ThemedView component - Main container component with theme support
 * Updated to use the new modular theme system
 */

import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'surface';
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );

  return (
    <View
      style={[{ backgroundColor }, getVariantStyle(variant), style]}
      {...otherProps}
    />
  );
}

function getVariantStyle(variant: 'default' | 'card' | 'surface') {
  switch (variant) {
    case 'card':
      return {
        borderRadius: 12,
        padding: 16,
      };
    case 'surface':
      return {
        borderRadius: 8,
        padding: 12,
      };
    default:
      return {};
  }
}