import { LegendList } from "@legendapp/list";
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlobalStyles } from '@/constants/theme';

import { ThemedView } from '@/components/themed-view';
import { ShoppingItem } from '@/types/types';
const ShoppingList = ({ items }: { items: ShoppingItem[] }) => {

  const getRowStyle = (state: string) => {
    switch (state) {
      case 'completed':
        return { bg: '#f0fdf4', accent: '#22c55e', badge: '#dcfce7', badgeText: '#15803d' };
      case 'pending':
        return { bg: '#fffbeb', accent: '#f59e0b', badge: '#fef3c7', badgeText: '#92400e' };
      case 'Credit':
        return { bg: '#eff6ff', accent: '#3b82f6', badge: '#dbeafe', badgeText: '#1e40af' };
      default:
        return { bg: '#ffffff', accent: '#e5e7eb', badge: '#f3f4f6', badgeText: '#374151' };
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'completed': return '✅';
      case 'pending':   return '🕒';
      case 'Credit':    return '💵';
      default:          return '❓';
    }
  };

  const renderItem = ({ item }: { item: ShoppingItem }) => {
    const rowStyle = getRowStyle(item.state);
    return (
      <Link
        href={{
          pathname: "/modal",
          params: {
            id: item.id,
            name: item.name,
            description: item.description,
            state: item.state,
          },
        }}
        asChild
      >
        <TouchableOpacity activeOpacity={0.7}>
          <View style={[styles.card, { backgroundColor: rowStyle.bg, borderLeftColor: rowStyle.accent }]}>
            <View style={styles.cardContent}>
              {/* Icon */}
              <View style={[styles.iconCircle, { backgroundColor: rowStyle.badge }]}>
                <Text style={styles.iconText}>{getStatusIcon(item.state)}</Text>
              </View>

              {/* Text */}
              <View style={styles.textBlock}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                  <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                ) : null}
              </View>

              {/* Right side: quantity + badge */}
              <View style={styles.rightBlock}>
                {(item.quantity || item.unit) ? (
                  <Text style={styles.quantity}>
                    {item.quantity} {item.unit}
                  </Text>
                ) : null}
                <View style={[styles.badge, { backgroundColor: rowStyle.badge }]}>
                  <Text style={[styles.badgeText, { color: rowStyle.badgeText }]}>{item.state}</Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <ThemedView style={GlobalStyles.light}> 
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping List</Text>
        <Text style={styles.headerCount}>{items.length} items</Text>
      </View>

      {/* Add Button */}
      <Link href="/modal" asChild>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
          <Text style={styles.addButtonText}>＋  Add New Item</Text>
        </TouchableOpacity>
      </Link>

      {/* List */}
      <LegendList
        style={styles.list}
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </ThemedView>
  );
};

export default ShoppingList;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: '#eaecec',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  headerCount: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#16a34a',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  rightBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});