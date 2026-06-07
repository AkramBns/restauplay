import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedCard } from '@/components/themed-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAccessToken } from '@/utils/auth';
import { useAuth } from '@/utils/auth-context';

interface DecodedToken {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

const decodeJWT = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return decoded as DecodedToken;
  } catch {
    return null;
  }
};

const formatDisplayName = (email?: string) => {
  if (!email) return 'Utilisateur RestauPlay';
  const [localPart] = email.split('@');
  return localPart
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();

  const loadUserData = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const decoded = decodeJWT(token);
        if (decoded) {
          setEmail(decoded.email);
          setUserId(decoded.sub);
        }
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const displayName = useMemo(() => formatDisplayName(email), [email]);

  const contactData = useMemo(
    () => [
      { label: 'Email', value: email || 'Non renseigné' },
      { label: 'Téléphone', value: '06 12 34 56 78' },
      { label: 'Adresse', value: '12 rue de la République, 75001 Paris' },
      { label: 'Date de naissance', value: '07/04/1990' },
    ],
    [email]
  );

  const accountData = useMemo(
    () => [
      { label: 'ID utilisateur', value: userId || 'Non disponible' },
      { label: 'Statut', value: 'Client Premium' },
      { label: 'Membre depuis', value: 'Janvier 2023' },
    ],
    [userId]
  );

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={<View style={styles.placeholderHeader} />}
      >
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={<View style={styles.placeholderHeader} />}
    >
      <ThemedView style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
            Mon profil
          </ThemedText>
        </View>

        <ThemedCard style={styles.profileSummaryCard}>
          <View style={styles.profileSummaryRow}>
            <View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}>
              <ThemedText style={styles.avatarInitials}>
                {displayName.charAt(0)}
              </ThemedText>
            </View>
            <View style={styles.profileSummaryText}>
              <ThemedText variant="titleMedium" style={styles.profileName}>
                {displayName}
              </ThemedText>
              <ThemedText style={styles.profileRole}>Client Premium</ThemedText>
              <ThemedText style={styles.profileMeta}>Membre depuis janvier 2023</ThemedText>
            </View>
          </View>
        </ThemedCard>

        <ThemedCard style={styles.sectionCard}>
          <ThemedText variant="labelLarge" style={styles.sectionHeading}>
            Détails de contact
          </ThemedText>
          {contactData.map(({ label, value }) => (
            <View key={label} style={styles.infoRow}>
              <ThemedText variant="labelMedium" style={styles.infoLabel}>
                {label}
              </ThemedText>
              <ThemedText style={styles.infoValue}>{value}</ThemedText>
            </View>
          ))}
        </ThemedCard>

        <ThemedCard style={styles.sectionCard}>
          <ThemedText variant="labelLarge" style={styles.sectionHeading}>
            Informations du compte
          </ThemedText>
          {accountData.map(({ label, value }) => (
            <View key={label} style={styles.infoRow}>
              <ThemedText variant="labelMedium" style={styles.infoLabel}>
                {label}
              </ThemedText>
              <ThemedText style={styles.infoValue}>{value}</ThemedText>
            </View>
          ))}
        </ThemedCard>

        <Pressable
          style={[styles.logoutButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={handleLogout}
        >
          <ThemedText type="title" style={styles.logoutButtonText}>
            Se déconnecter
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  placeholderHeader: {
    width: '100%',
    height: 240,
    backgroundColor: '#D0D0D0',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  titleContainer: {
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  profileSummaryCard: {
    marginBottom: 16,
    padding: 20,
  },
  profileSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  profileSummaryText: {
    flex: 1,
  },
  profileName: {
    marginBottom: 6,
  },
  profileRole: {
    fontSize: 15,
    color: '#687076',
    marginBottom: 4,
  },
  profileMeta: {
    fontSize: 13,
    color: '#A1A8AF',
  },
  sectionCard: {
    marginBottom: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  sectionHeading: {
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 14,
  },
  infoLabel: {
    marginBottom: 4,
    color: '#687076',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
