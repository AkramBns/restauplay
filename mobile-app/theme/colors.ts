/**
 * Color palette for the RestauPlay app
 * Supports light and dark modes with semantic color names
 */

export const ColorPalette = {
  light: {
    primary: '#0a7ea4',
    primaryLight: '#E0F7FA',
    primaryDark: '#00796B',
    secondary: '#FF6B6B',
    secondaryLight: '#FFE0E0',
    secondaryDark: '#D32F2F',
    success: '#4CAF50',
    successLight: '#E8F5E9',
    error: '#F44336',
    errorLight: '#FFEBEE',
    warning: '#FF9800',
    warningLight: '#FFF3E0',
    info: '#2196F3',
    infoLight: '#E3F2FD',
    text: '#11181C',
    textSecondary: '#687076',
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    border: '#E0E0E0',
    divider: '#EEEEEE',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    placeholder: '#BDBDBD',
  },
  dark: {
    primary: '#4DD0E1',
    primaryLight: '#00796B',
    primaryDark: '#E0F2F1',
    secondary: '#FF8A80',
    secondaryLight: '#B71C1C',
    secondaryDark: '#FF5252',
    success: '#81C784',
    successLight: '#1B5E20',
    error: '#EF5350',
    errorLight: '#B71C1C',
    warning: '#FFB74D',
    warningLight: '#E65100',
    info: '#64B5F6',
    infoLight: '#0D47A1',
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#121212',
    backgroundSecondary: '#1E1E1E',
    border: '#424242',
    divider: '#2C2C2C',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#4DD0E1',
    placeholder: '#757575',
  },
};

export type ColorKey = keyof typeof ColorPalette.light;
export type Theme = 'light' | 'dark';