import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert, Platform, DevSettings } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  LanguageCode,
  applyLanguage,
  loadSavedLanguage,
  isRTL,
} from '../i18n';

interface LanguageContextValue {
  language: LanguageCode;
  loading: boolean;
  setLanguage: (lang: LanguageCode) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = await loadSavedLanguage();
      setLanguageState(saved);
      setLoading(false);
    })();
  }, []);

  async function setLanguage(lang: LanguageCode) {
    const directionChanged = isRTL(language) !== isRTL(lang);
    await applyLanguage(lang);
    setLanguageState(lang);

    // Text updates instantly. Layout mirroring (RTL) needs a real app
    // restart to fully take effect, so prompt for it only when it matters.
    if (Platform.OS !== 'web' && directionChanged) {
      const canAutoReload = __DEV__ && typeof DevSettings?.reload === 'function';
      Alert.alert(
        t('common.restartRequiredTitle'),
        t('common.restartRequiredMessage'),
        canAutoReload
          ? [
              { text: t('common.later'), style: 'cancel' },
              { text: t('common.restartNow'), onPress: () => DevSettings.reload() },
            ]
          : [{ text: t('common.ok') }]
      );
    }
  }

  return (
    <LanguageContext.Provider value={{ language, loading, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
