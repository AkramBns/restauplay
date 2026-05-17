/**
 * ThemedCard component - Reusable card component with theme integration
 * Provides a container with consistent styling and spacing
 */

import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ThemedCardProps extends ViewProps {
  children?: React.ReactNode;
  elevated?: boolean;
}

export function ThemedCard({ style, elevated = true, children, ...props }: ThemedCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.backgroundSecondary,
          borderRadius: 12,
          padding: theme.componentSpacing.cardPadding,
          borderColor: theme.colors.border,
          borderWidth: 1,
        },
        elevated && theme.shadows?.md,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}