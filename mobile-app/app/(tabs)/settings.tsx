import { useThemeMode } from '@/context/ThemeContext';
import { ThemedButton } from '@/components/themed-button';

export function SettingsScreen() {
  const { theme, setTheme, toggleTheme } = useThemeMode();

  return (
    <>
      {/* Toggle button */}
      <ThemedButton onPress={toggleTheme}>
        Switch Theme
      </ThemedButton>

      {/* Or set specific theme */}
      <ThemedButton onPress={() => setTheme('light')}>
        Light Mode
      </ThemedButton>
      <ThemedButton onPress={() => setTheme('dark')}>
        Dark Mode
      </ThemedButton>
      <ThemedButton onPress={() => setTheme('auto')}>
        System Default
      </ThemedButton>
    </>
  );
}