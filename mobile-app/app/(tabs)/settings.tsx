import { StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useThemeMode } from '@/context/ThemeContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/themed-button';
import { ThemedCard } from '@/components/themed-card';

export default function SettingsScreen() {
  const theme = useTheme();
  const { theme: currentTheme, toggleTheme, setTheme } = useThemeMode();

  const getThemeLabel = () => {
    if (currentTheme === 'auto') return 'System';
    return currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <ThemedView style={styles.section}>
        <ThemedText variant="headlineLarge" style={styles.title}>
          Settings
        </ThemedText>
      </ThemedView>

      <ThemedCard style={styles.card}>
        <ThemedText variant="titleMedium" style={styles.sectionTitle}>
          Theme Settings
        </ThemedText>
        <ThemedText variant="bodyMedium" style={styles.description}>
          Current Theme: {getThemeLabel()}
        </ThemedText>

        <ThemedView style={styles.buttonGroup}>
          <ThemedButton
            variant={currentTheme === 'light' ? 'primary' : 'outline'}
            size="md"
            onPress={() => setTheme('light')}
            style={styles.button}
          >
            Light
          </ThemedButton>
          <ThemedButton
            variant={currentTheme === 'dark' ? 'primary' : 'outline'}
            size="md"
            onPress={() => setTheme('dark')}
            style={styles.button}
          >
            Dark
          </ThemedButton>
          <ThemedButton
            variant={currentTheme === 'auto' ? 'primary' : 'outline'}
            size="md"
            onPress={() => setTheme('auto')}
            style={styles.button}
          >
            Auto
          </ThemedButton>
        </ThemedView>

        <ThemedButton
          variant="secondary"
          size="lg"
          onPress={toggleTheme}
          style={styles.toggleButton}
        >
          Toggle Theme
        </ThemedButton>
      </ThemedCard>

      <ThemedCard style={styles.card}>
        <ThemedText variant="titleMedium" style={styles.sectionTitle}>
          About
        </ThemedText>
        <ThemedText variant="bodySmall" style={styles.description}>
          RestauPlay v1.0.0
        </ThemedText>
      </ThemedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 8,
  },
  card: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },
  toggleButton: {
    marginTop: 8,
  },
});