import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth, canManageAllShoppingItems } from '../../src/context/AuthContext';
import { api, ApiError } from '../../src/api/client';
import { ShoppingItem, ShoppingStatus } from '../../src/api/types';

type ViewFilter = 'today' | 'upcoming' | 'all';

const STATUS_COLORS: Record<ShoppingStatus, string> = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  completed: '#16a34a',
  cancelled: '#9ca3af',
};

// Canonical (English) category values, stored as-is in the database so
// filtering/matching stays consistent no matter what language each user has
// selected. Only the *label* shown in the UI is translated — see
// categoryLabel() below. Users can still type a fully custom category, which
// simply won't have a translation and is shown verbatim.
const SUGGESTED_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Meat & Fish',
  'Dairy',
  'Bakery',
  'Beverages',
  'Cleaning',
  'Other',
];

const CATEGORY_I18N_KEYS: Record<string, string> = {
  Vegetables: 'vegetables',
  Fruits: 'fruits',
  'Meat & Fish': 'meatFish',
  Dairy: 'dairy',
  Bakery: 'bakery',
  Beverages: 'beverages',
  Cleaning: 'cleaning',
  Other: 'other',
};

export default function ShoppingListScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isPrivileged = canManageAllShoppingItems(user?.role);

  function categoryLabel(raw: string) {
    const key = CATEGORY_I18N_KEYS[raw];
    return key ? t(`shopping.categories.${key}`) : raw;
  }

  const STATUS_LABELS: Record<ShoppingStatus, string> = {
    pending: t('shopping.status.pending'),
    in_progress: t('shopping.status.in_progress'),
    completed: t('shopping.status.completed'),
    cancelled: t('shopping.status.cancelled'),
  };

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewFilter>('today');
  const [statusFilter, setStatusFilter] = useState<ShoppingStatus | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ view });
      if (statusFilter) params.set('status', statusFilter);
      const { items } = await api.get<{ items: ShoppingItem[] }>(`/shopping-items?${params}`);
      setItems(items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('shopping.loadFailedError'));
    } finally {
      setLoading(false);
    }
  }, [view, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return Array.from(set).sort();
  }, [items]);

  const visibleItems = useMemo(
    () => (categoryFilter ? items.filter((i) => i.category === categoryFilter) : items),
    [items, categoryFilter]
  );

  function canEdit(item: ShoppingItem) {
    return isPrivileged || item.createdById === user?.id;
  }

  async function handleStatusChange(item: ShoppingItem, status: ShoppingStatus) {
    try {
      await api.put(`/shopping-items/${item.id}`, { status });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('shopping.updateFailedError'));
    }
  }

  async function handleDelete(item: ShoppingItem) {
    try {
      await api.delete(`/shopping-items/${item.id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('shopping.deleteFailedError'));
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {(['today', 'upcoming', 'all'] as ViewFilter[]).map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.filterChip, view === v && styles.filterChipActive]}
            onPress={() => setView(v)}
          >
            <Text style={[styles.filterChipText, view === v && styles.filterChipTextActive]}>
              {v === 'today'
                ? t('shopping.filters.todayOverdue')
                : v === 'upcoming'
                ? t('shopping.filters.upcoming')
                : t('shopping.filters.all')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusRow}>
        <TouchableOpacity
          style={[styles.statusChip, !statusFilter && styles.statusChipActive]}
          onPress={() => setStatusFilter(null)}
        >
          <Text style={[styles.statusChipText, !statusFilter && styles.statusChipTextActive]}>
            {t('shopping.filters.allStatuses')}
          </Text>
        </TouchableOpacity>
        {(Object.keys(STATUS_LABELS) as ShoppingStatus[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusChip, statusFilter === s && styles.statusChipActive]}
            onPress={() => setStatusFilter(s)}
          >
            <Text style={[styles.statusChipText, statusFilter === s && styles.statusChipTextActive]}>
              {STATUS_LABELS[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusRow}>
          <TouchableOpacity
            style={[styles.categoryChip, !categoryFilter && styles.categoryChipActive]}
            onPress={() => setCategoryFilter(null)}
          >
            <Text style={[styles.categoryChipText, !categoryFilter && styles.categoryChipTextActive]}>
              {t('shopping.filters.allCategories')}
            </Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.categoryChip, categoryFilter === c && styles.categoryChipActive]}
              onPress={() => setCategoryFilter(c)}
            >
              <Text style={[styles.categoryChipText, categoryFilter === c && styles.categoryChipTextActive]}>
                {categoryLabel(c)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>{t('shopping.noItems')}</Text>}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={{ flex: 1 }}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemName}>
                    {item.name} — {item.quantity} {item.unit}
                  </Text>
                </View>
                {item.category ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{categoryLabel(item.category)}</Text>
                  </View>
                ) : null}
                {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
                <Text style={styles.itemMeta}>
                  {t('shopping.planned')}: {new Date(item.plannedOn).toLocaleDateString()}
                  {item.price ? ` · ${item.price.toFixed(2)}/unit` : ''}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                  <Text style={styles.statusBadgeText}>{STATUS_LABELS[item.status]}</Text>
                </View>
              </View>

              <View style={styles.itemActions}>
                {canEdit(item) && item.status !== 'completed' && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setEditingItem(item)}
                    accessibilityLabel={t('shopping.actions.edit')}
                  >
                    <Ionicons name="create-outline" size={20} color="#2563eb" />
                  </TouchableOpacity>
                )}
                {isPrivileged && item.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleStatusChange(item, 'in_progress')}
                    accessibilityLabel={t('shopping.actions.start')}
                  >
                    <Ionicons name="play-circle-outline" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                )}
                {isPrivileged && (item.status === 'pending' || item.status === 'in_progress') && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleStatusChange(item, 'completed')}
                    accessibilityLabel={t('shopping.actions.complete')}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#16a34a" />
                  </TouchableOpacity>
                )}
                {canEdit(item) && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDelete(item)}
                    accessibilityLabel={t('shopping.actions.delete')}
                  >
                    <Ionicons name="trash-outline" size={20} color="#dc2626" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <ItemFormModal
        visible={showAddModal || !!editingItem}
        item={editingItem}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(null);
        }}
        onSaved={() => {
          setShowAddModal(false);
          setEditingItem(null);
          load();
        }}
      />
    </View>
  );
}

function ItemFormModal({
  visible,
  item,
  onClose,
  onSaved,
}: {
  visible: boolean;
  item: ShoppingItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState('');
  const [plannedOn, setPlannedOn] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function categoryLabel(raw: string) {
    const key = CATEGORY_I18N_KEYS[raw];
    return key ? t(`shopping.categories.${key}`) : raw;
  }

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setCategory(item.category || '');
      setQuantity(String(item.quantity));
      setUnit(item.unit);
      setPrice(item.price ? String(item.price) : '');
      setPlannedOn(item.plannedOn.slice(0, 10));
    } else {
      setName('');
      setDescription('');
      setCategory('');
      setQuantity('');
      setUnit('');
      setPrice('');
      setPlannedOn(new Date().toISOString().slice(0, 10));
    }
    setError(null);
  }, [item, visible]);

  async function handleSave() {
    if (!name || !quantity || !unit || !plannedOn) {
      setError(t('shopping.requiredFieldsError'));
      return;
    }
    setSaving(true);
    setError(null);
    const payload: Record<string, unknown> = {
      name,
      description: description || null,
      category: category || null,
      quantity: parseFloat(quantity),
      unit,
      price: price ? parseFloat(price) : null,
      plannedOn,
    };
    try {
      if (item) {
        await api.put(`/shopping-items/${item.id}`, payload);
      } else {
        await api.post('/shopping-items', payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('shopping.saveFailedError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalCard} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.modalTitle}>{item ? t('shopping.editItem') : t('shopping.addItem')}</Text>
          {error && <Text style={styles.error}>{error}</Text>}

          <TextInput style={styles.input} placeholder={t('shopping.namePlaceholder')} value={name} onChangeText={setName} />
          <TextInput
            style={styles.input}
            placeholder={t('shopping.descriptionPlaceholder')}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>{t('shopping.categoryLabel')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            {SUGGESTED_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.categoryPickChip, category === c && styles.categoryPickChipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.categoryPickChipText, category === c && styles.categoryPickChipTextActive]}>
                  {categoryLabel(c)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput
            style={styles.input}
            placeholder={t('shopping.categoryPlaceholder')}
            value={category}
            onChangeText={setCategory}
          />

          <TextInput
            style={styles.input}
            placeholder={t('shopping.quantityPlaceholder')}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
          <TextInput style={styles.input} placeholder={t('shopping.unitPlaceholder')} value={unit} onChangeText={setUnit} />
          <TextInput
            style={styles.input}
            placeholder={t('shopping.pricePlaceholder')}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <TextInput
            style={styles.input}
            placeholder={t('shopping.plannedOnPlaceholder')}
            value={plannedOn}
            onChangeText={setPlannedOn}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{t('common.save')}</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8 },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterChipActive: { backgroundColor: '#2563eb' },
  filterChipText: { color: '#333', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  statusRow: { paddingHorizontal: 12, marginBottom: 4, flexGrow: 0 },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f7f7f7',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statusChipActive: { backgroundColor: '#111', borderColor: '#111' },
  statusChipText: { fontSize: 12, color: '#444' },
  statusChipTextActive: { color: '#fff' },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 },
  error: { color: '#dc2626', textAlign: 'center', marginVertical: 8 },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#f7f7f9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  itemHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  itemName: { fontSize: 15, fontWeight: '600' },
  itemDesc: { fontSize: 13, color: '#666', marginTop: 2 },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 6,
  },
  statusBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  itemActions: { justifyContent: 'space-around', alignItems: 'center', marginLeft: 8, gap: 10 },
  iconButton: { padding: 4 },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 7,
    marginTop: 3,
  },
  categoryBadgeText: { fontSize: 11, color: '#4338ca', fontWeight: '600' },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#eef2ff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  categoryChipActive: { backgroundColor: '#4338ca', borderColor: '#4338ca' },
  categoryChipText: { fontSize: 12, color: '#4338ca' },
  categoryChipTextActive: { color: '#fff' },
  categoryPickChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryPickChipActive: { backgroundColor: '#4338ca' },
  categoryPickChipText: { fontSize: 12, color: '#333' },
  categoryPickChipTextActive: { color: '#fff' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 15 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: { paddingVertical: 10, paddingHorizontal: 18 },
  secondaryButtonText: { color: '#666', fontWeight: '600' },
});
