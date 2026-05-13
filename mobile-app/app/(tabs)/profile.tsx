import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
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

// Helper function to decode JWT
const decodeJWT = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    return decoded as DecodedToken;
  } catch {
    return null;
  }
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

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="person.fill"
            style={styles.headerImage}
          />
        }>
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="person.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Profile
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.profileCard}>
        <ThemedText type="subtitle" style={styles.label}>Email</ThemedText>
        <ThemedText style={styles.value}>{email || 'Not available'}</ThemedText>
        
        <ThemedText type="subtitle" style={[styles.label, { marginTop: 16 }]}>User ID</ThemedText>
        <ThemedText style={styles.value}>{userId || 'Not available'}</ThemedText>
      </ThemedView>

      <Pressable
        style={[
          styles.logoutButton,
          { backgroundColor: Colors[colorScheme ?? 'light'].tint }
        ]}
        onPress={handleLogout}>
        <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
      </Pressable>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  profileCard: {
    padding: 16,
    marginVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
