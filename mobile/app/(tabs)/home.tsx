import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/api/client';
import { Announcement } from '../../src/api/types';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { announcements } = await api.get<{ announcements: Announcement[] }>('/announcements');
      setAnnouncements(announcements);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
    >
      <Text style={styles.welcome}>{t('home.welcome', { name: user?.firstName })}</Text>
      <Text style={styles.role}>{t('home.role', { role: user?.role })}</Text>

      <Text style={styles.sectionTitle}>{t('home.announcements')}</Text>
      {announcements.length === 0 && <Text style={styles.empty}>{t('home.noAnnouncements')}</Text>}
      {announcements.map((a) => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.cardTitle}>{a.title}</Text>
          <Text style={styles.cardDate}>{new Date(a.publishedAt).toLocaleDateString()}</Text>
          {/* NOTE: htmlContent comes from trusted admin input in this app.
              For production, render with react-native-render-html and
              sanitize server-side before storing. */}
          <Text style={styles.cardBody}>{stripHtml(a.htmlContent)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').trim();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcome: { fontSize: 24, fontWeight: '700' },
  role: { fontSize: 14, color: '#666', marginBottom: 20, textTransform: 'capitalize' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  empty: { color: '#888' },
  card: {
    backgroundColor: '#f5f5f7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardDate: { fontSize: 12, color: '#888', marginBottom: 6 },
  cardBody: { fontSize: 14, color: '#333' },
});
