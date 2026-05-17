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
          borderColor: theme.colors.success,
          statusColor: theme.colors.success,
          textColor: theme.colors.text,
        };
      case 'pending':
        return {
          backgroundColor: theme.colors.warningLight,
          borderColor: theme.colors.warning,
          statusColor: theme.colors.warning,
          textColor: theme.colors.text,
        };
      case 'Credit':
        return {
          backgroundColor: theme.colors.infoLight,
          borderColor: theme.colors.info,
          statusColor: theme.colors.info,
          textColor: theme.colors.text,
        };
      default:
        return {
          backgroundColor: theme.colors.backgroundSecondary,
          borderColor: theme.colors.border,
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
        return 'Done';
      case 'pending':
        return 'Pending';
      case 'Credit':
        return 'Credit';
      default:
        return '?';
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
        style={styles.listContainer}
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
                    borderColor: statusStyle.borderColor,
                  },
                ]}
                activeOpacity={0.7}
              >
                {/* Icon + Status Badge Group */}
                <View style={styles.iconStatusGroup}>
                  <Ionicons
                    name={statusIcon.name}
                    size={24}
                    color={statusStyle.statusColor}
                  />
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
                </View>

                {/* Text Container */}
                <View style={[styles.textContainer, { flex: 1 }]}>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  addButtonIcon: {
    marginRight: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  iconStatusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    gap: 6,
  },
  textContainer: {
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
  },
});
