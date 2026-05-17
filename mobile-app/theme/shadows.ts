/**
 * Shadow system for RestauPlay app
 * Based on Material Design 3 elevation system
 */

import { Platform } from 'react-native';

export const Shadows = Platform.select({
  ios: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  default: {
    sm: { elevation: 2 },
    md: { elevation: 4 },
    lg: { elevation: 8 },
    xl: { elevation: 12 },
  },
});

export type ShadowKey = keyof typeof Shadows;