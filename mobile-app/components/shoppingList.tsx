import { LegendList } from "@legendapp/list";
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/themed-button';
import { ShoppingItem } from '@/types/types';
import { Link } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

const ShoppingList = ({ items }: { items: ShoppingItem[] }) => {
  const theme = useTheme();

  const getStatusStyle = (state: string) => {
    switch (state) {
      case 'completed':
        return {
          backgroundColor: theme.colors.successLight,
          borderLeftColor: theme.colors.success,
          statusColor: theme.colors.success,
          textColor: theme.colors.text,
        };
      case 'pending':
        return {
          backgroundColor: theme.colors.warningLight,
          borderLeftColor: theme.colors.warning,
          statusColor: theme.colors.warning,
          textColor: theme.colors.text,
        };
      case 'Credit':
        return {
          backgroundColor: theme.colors.infoLight,
          borderLeftColor: theme.colors.info,
          statusColor: theme.colors.info,
          textColor: theme.colors.text,
        };
      default:
        return {
          backgroundColor: theme.colors.backgroundSecondary,
          borderLeftColor: theme.colors.border,
          statusColor: theme.colors.textSecondary,
          textColor: theme.colors.text,
        };
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'completed':
        return { name: 'checkmark-circle' as const, size: 24 };
      case 'pending':
        return { name: 'time' as const, size: 24 };
      case 'Credit':
        return { name: 'card' as const, size: 24 };
      default:
        return { name: 'help-circle' as const, size: 24 };
    }
  };

  const getStatusLabel = (state: string) => {
    switch (state) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'Credit':
        return 'Credit';
      default:
        return 'Unknown';
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Link href="/modal" asChild>
        <TouchableOpacity style={styles.addButtonWrapper}>
          <ThemedButton variant="primary" size="lg" style={styles.addButton}>
            <Ionicons name="add-circle" size={20} color="#fff" style={styles.addButtonIcon} />
            Add New Item
          </ThemedButton>
        </TouchableOpacity>
      </Link>

      <LegendList
        style={{ flex: 1 }}
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const statusStyle = getStatusStyle(item.state);
          const statusIcon = getStatusIcon(item.state);

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
              <TouchableOpacity
                style={[
                  styles.row,
                  {
                    backgroundColor: statusStyle.backgroundColor,
                    borderLeftColor: statusStyle.borderLeftColor,
                  },
                ]}
                activeOpacity={0.7}
              >
                {/* Status Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={statusIcon.name}
                    size={statusIcon.size}
                    color={statusStyle.statusColor}
                  />
                </View>

                {/* Text Container */}
                <View style={styles.textContainer}>
                  <ThemedText
                    variant="titleMedium"
                    style={[
                      styles.name,
                      { color: statusStyle.textColor },
                    ]}
                  >
                    {item.name}
                  </ThemedText>
                  <ThemedText
                    variant="bodySmall"
                    style={[
                      styles.description,
                      { color: statusStyle.textColor },
                    ]}
                  >
                    {item.quantity} {item.unit}
                  </ThemedText>
                  {item.description && (
                    <ThemedText
                      variant="labelSmall"
                      style={[
                        styles.note,
                        { color: statusStyle.textColor },
                      ]}
                    >
                      {item.description}
                    </ThemedText>
                  )}
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusStyle.statusColor },
                  ]}
                >
                  <ThemedText
                    variant="labelSmall"
                    style={styles.statusBadgeText}
                  >
                    {getStatusLabel(item.state)}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </ThemedView>
  );
};

export default ShoppingList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addButtonWrapper: {
    padding: 12,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  addButtonIcon: {
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  iconContainer: {
    marginRight: 12,
    width: 28,
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontWeight: '600',
  },
  description: {
    marginTop: 2,
  },
  note: {
    marginTop: 4,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
