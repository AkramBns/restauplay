import { Ionicons } from '@expo/vector-icons';
import { LegendList } from "@legendapp/list";
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { ShoppingItem } from '@/types/types';
import { Link } from 'expo-router';

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
        <ThemedButton variant="primary" size="lg" style={[styles.addButton, styles.addButtonWrapper]}>
          <Ionicons name="add-circle" size={20} color="#fff" style={styles.addButtonIcon} />
          Add New Item
        </ThemedButton>
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
              {
                // compute inline row style with sensible fallbacks so the border is always visible
              }
              <TouchableOpacity
                style={[
                  styles.row,
                  {
                    backgroundColor: statusStyle.backgroundColor,
                  },
                  // ensure borderColor falls back to theme border or a neutral value
                  {
                    borderColor: statusStyle.borderColor ?? theme.colors.border ?? '#ddd',
                    borderStyle: 'solid',
                    // subtle shadow/elevation to make the rounded card stand out
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 2,
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
                   
                  >
                    <ThemedText variant="labelSmall" >
                       {item.quantity} {item.unit} {item.name}
                    </ThemedText>
                  </View>
                </View>

                {/* Text Container */}
                <View style={[styles.textContainer, { flex: 1 }]}>
                  {item.description && (
                    <ThemedText
                      variant="bodySmall"
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
    borderWidth: 2, 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 12,
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
