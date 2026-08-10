import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar'] as const;
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية',
};

const RTL_LANGUAGES: LanguageCode[] = ['ar'];
const STORAGE_KEY = 'app_language';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes values
  compatibilityJSON: 'v3',
});

export function isRTL(lang: LanguageCode) {
  return RTL_LANGUAGES.includes(lang);
}

// Reads the previously saved language (if any) and applies it to i18next +
// I18nManager without writing back to storage (avoids a redundant write on boot).
export async function loadSavedLanguage(): Promise<LanguageCode> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && (SUPPORTED_LANGUAGES as readonly string[]).includes(saved)) {
      await applyLanguage(saved as LanguageCode, false);
      return saved as LanguageCode;
    }
  } catch {
    // AsyncStorage unavailable/corrupt — fall back to default silently
  }
  return 'en';
}

// Switches i18next's active language and syncs React Native's RTL flag.
// NOTE: I18nManager's layout-direction change only fully takes effect after
// an app restart — the caller is responsible for prompting the user to
// restart when the RTL-ness actually changes (see LanguageContext).
export async function applyLanguage(lang: LanguageCode, persist = true): Promise<void> {
  await i18n.changeLanguage(lang);

  const shouldBeRTL = isRTL(lang);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.allowRTL(shouldBeRTL);
    I18nManager.forceRTL(shouldBeRTL);
  }

  if (persist) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // best-effort persistence; language still applies for this session
    }
  }
}

export default i18n;
