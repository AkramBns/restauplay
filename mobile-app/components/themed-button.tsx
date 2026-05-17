/**
 * ThemedButton component - Reusable button with theme integration
 * Provides multiple variants and sizes
 */

import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ThemedButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children: React.ReactNode;
}

export function ThemedButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  children,
  ...props
}: ThemedButtonProps) {
  const theme = useTheme();
  const buttonStyles = getButtonStyles(theme, variant, size, disabled);

  return (
    <Pressable
      style={[buttonStyles.container, disabled && styles.disabled, style]}
      disabled={disabled}
      {...props}
    >
      <Text style={buttonStyles.text}>{children}</Text>
    </Pressable>
  );
}

function getButtonStyles(
  theme: ReturnType<typeof useTheme>,
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
) {
  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(theme, variant, disabled);

  return {
    container: [sizeStyles.container, variantStyles.container],
    text: [sizeStyles.text, variantStyles.text],
  };
}

function getSizeStyles(size: ButtonSize) {
  const sizeMap = {
    sm: {
      container: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
      },
      text: { fontSize: 12, fontWeight: '500' as const },
    },
    md: {
      container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
      },
      text: { fontSize: 14, fontWeight: '500' as const },
    },
    lg: {
      container: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 10,
      },
      text: { fontSize: 16, fontWeight: '600' as const },
    },
  };

  return sizeMap[size];
}

function getVariantStyles(
  theme: ReturnType<typeof useTheme>,
  variant: ButtonVariant,
  disabled: boolean
) {
  const variantMap: Record<ButtonVariant, any> = {
    primary: {
      container: {
        backgroundColor: disabled
          ? theme.colors.textSecondary
          : theme.colors.primary,
      },
      text: { color: '#fff' },
    },
    secondary: {
      container: {
        backgroundColor: disabled
          ? theme.colors.backgroundSecondary
          : theme.colors.secondary,
      },
      text: { color: '#fff' },
    },
    success: {
      container: {
        backgroundColor: disabled
          ? theme.colors.textSecondary
          : theme.colors.success,
      },
      text: { color: '#fff' },
    },
    error: {
      container: {
        backgroundColor: disabled
          ? theme.colors.textSecondary
          : theme.colors.error,
      },
      text: { color: '#fff' },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled
          ? theme.colors.border
          : theme.colors.primary,
      },
      text: { color: disabled ? theme.colors.textSecondary : theme.colors.primary },
    },
  };

  return variantMap[variant];
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
});