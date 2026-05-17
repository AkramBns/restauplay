import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import ShoppingList from '@/components/shoppingList';
import { API_ENDPOINTS } from '@/constants/api';
import { ShoppingItem } from '@/types/types';
import { getAccessToken } from '@/utils/auth';


export default function ShoppingScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
      try {
        setLoading(true);
        const token = await getAccessToken();
        console.log(`Fetching items from ${API_ENDPOINTS.transactions}`);
        const response = await fetch(API_ENDPOINTS.transactions, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setItems(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch items');
        setItems([]);
        console.log(err)
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
  
    fetchItems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems(); // your existing fetch function
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/logo_518.png')}
            style={styles.reactLogo}
          />
        }>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      </ParallaxScrollView>
    );
  }

  if (error) {
    return (
      <ParallaxScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchItems} />  }
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
             
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          /> }
        >
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </ParallaxScrollView>
    );
  }

return (
    <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#eef1f1' }}
          headerImage={
            <Image
              source={require('@/assets/images/logo_518_ListeDesCourses.png')}
              style={styles.reactLogo}
              contentFit="cover"
            />
          }
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >         
        <ShoppingList items={items} />  
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  centerContainer: {
     width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});