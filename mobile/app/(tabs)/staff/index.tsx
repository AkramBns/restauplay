import React, { useCallback, useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { api, ApiError } from '../../../src/api/client';
import { User, Role, Presence, Vacation, PresenceStatus } from '../../../src/api/types';

type SubTab = 'registry' | 'presence';

export default function StaffScreen() {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState<SubTab>('registry');

  return (
    <View style={styles.container}>
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTabButton, subTab === 'registry' && styles.subTabButtonActive]}
          onPress={() => setSubTab('registry')}
        >
          <Text style={[styles.subTabText, subTab === 'registry' && styles.subTabTextActive]}>
            {t('staff.registryTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTabButton, subTab === 'presence' && styles.subTabButtonActive]}
          onPress={() => setSubTab('presence')}
        >
          <Text style={[styles.subTabText, subTab === 'presence' && styles.subTabTextActive]}>
            {t('staff.presenceTab')}
          </Text>
        </TouchableOpacity>
      </View>

      {subTab === 'registry' ? <StaffRegistry /> : <PresenceModule />}
    </View>
  );
}

// ---------- STAFF REGISTRY ----------

function StaffRegistry() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await api.get<{ users: User[] }>('/users');
      setUsers(users);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('staff.loadFailedError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleBlock(u: User) {
    const accountStatus = u.accountStatus === 'active' ? 'blocked' : 'active';
    try {
      await api.put(`/users/${u.id}`, { accountStatus });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('staff.updateFailedError'));
    }
  }

  async function removeUser(u: User) {
    try {
      await api.delete(`/users/${u.id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('staff.removeFailedError'));
    }
  }

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 32 }} />;

  return (
    <View style={{ flex: 1 }}>
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item: u }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>
                {u.firstName} {u.lastName} {u.accountStatus === 'blocked' ? t('staff.blocked') : ''}
              </Text>
              <Text style={styles.cardMeta}>
                {u.email} · {t(`staff.roles.${u.role}`)}
              </Text>
              {u.phone ? <Text style={styles.cardMeta}>{u.phone}</Text> : null}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => setEditingUser(u)}>
                <Text style={styles.actionLink}>{t('common.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleBlock(u)}>
                <Text style={[styles.actionLink, { color: u.accountStatus === 'active' ? '#dc2626' : '#16a34a' }]}>
                  {u.accountStatus === 'active' ? t('staff.block') : t('staff.unblock')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeUser(u)}>
                <Text style={[styles.actionLink, { color: '#dc2626' }]}>{t('staff.remove')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowForm(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <UserFormModal
        visible={showForm || !!editingUser}
        user={editingUser}
        onClose={() => {
          setShowForm(false);
          setEditingUser(null);
        }}
        onSaved={() => {
          setShowForm(false);
          setEditingUser(null);
          load();
        }}
      />
    </View>
  );
}

function UserFormModal({
  visible,
  user,
  onClose,
  onSaved,
}: {
  visible: boolean;
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [startWorkDate, setStartWorkDate] = useState('');
  const [role, setRole] = useState<Role>('staff');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setPassword('');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setBirthDate(user.birthDate ? user.birthDate.slice(0, 10) : '');
      setStartWorkDate(user.startWorkDate ? user.startWorkDate.slice(0, 10) : '');
      setRole(user.role);
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setAddress('');
      setBirthDate('');
      setStartWorkDate('');
      setRole('staff');
    }
    setError(null);
  }, [user, visible]);

  async function handleSave() {
    if (!firstName || !lastName || !email || (!user && !password)) {
      setError(t('staff.requiredFieldsError'));
      return;
    }
    setSaving(true);
    setError(null);
    const payload: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      phone: phone || null,
      address: address || null,
      birthDate: birthDate || null,
      startWorkDate: startWorkDate || null,
      role,
    };
    if (password) payload.password = password;

    try {
      if (user) {
        await api.put(`/users/${user.id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('staff.saveFailedError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <ScrollView style={styles.modalCard} contentContainerStyle={{ paddingBottom: 20 }}>
          <Text style={styles.modalTitle}>{user ? t('staff.editStaff') : t('staff.addStaff')}</Text>
          {error && <Text style={styles.error}>{error}</Text>}

          <TextInput style={styles.input} placeholder={t('staff.firstNamePlaceholder')} value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder={t('staff.lastNamePlaceholder')} value={lastName} onChangeText={setLastName} />
          <TextInput
            style={styles.input}
            placeholder={t('staff.emailPlaceholder')}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder={user ? t('staff.newPasswordPlaceholder') : t('staff.passwordPlaceholder')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TextInput style={styles.input} placeholder={t('staff.phonePlaceholder')} value={phone} onChangeText={setPhone} />
          <TextInput style={styles.input} placeholder={t('staff.addressPlaceholder')} value={address} onChangeText={setAddress} />
          <TextInput
            style={styles.input}
            placeholder={t('staff.birthDatePlaceholder')}
            value={birthDate}
            onChangeText={setBirthDate}
          />
          <TextInput
            style={styles.input}
            placeholder={t('staff.startWorkDatePlaceholder')}
            value={startWorkDate}
            onChangeText={setStartWorkDate}
          />

          <Text style={styles.label}>{t('staff.roleLabel')}</Text>
          <View style={styles.roleRow}>
            {(['staff', 'buyer', 'admin'] as Role[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleChip, role === r && styles.roleChipActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{t(`staff.roles.${r}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>

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

// ---------- PRESENCE MODULE ----------
// Simplified calendar: shows current month's days per staff member, tap a
// day to set/edit presence status. Vacations are listed as date-range bars
// beneath the grid. This is intentionally lean scaffolding — swap in a
// library like react-native-calendars for a richer visual grid.

function PresenceModule() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await api.get<{ users: User[] }>('/users');
      setUsers(users);
      const uid = selectedUserId || users[0]?.id || null;
      setSelectedUserId(uid);

      if (uid) {
        const from = monthStart.toISOString().slice(0, 10);
        const to = monthEnd.toISOString().slice(0, 10);
                  console.log('Fetching presences and vacations for user', uid, 'from', from, 'to', to) ;

        const [{ presences }, { vacations }] = await Promise.all([
          api.get<{ presences: Presence[] }>(`/presence?userId=${uid}&from=${from}&to=${to}`),
          api.get<{ vacations: Vacation[] }>(`/vacations?userId=${uid}&from=${from}&to=${to}`),
        ]);
        setPresences(presences);
        setVacations(vacations);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('staff.presence.loadFailedError'));
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    load();
  }, [selectedUserId]);

  async function setDayStatus(day: number, status: PresenceStatus) {
    if (!selectedUserId) return;
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day).toISOString().slice(0, 10);
    // Optimistically update local state so repeated taps immediately cycle
    setPresences((prev) => {
      const foundIndex = prev.findIndex((p) => p.date.slice(0, 10) === date);
      if (foundIndex >= 0) {
        const copy = [...prev];
        copy[foundIndex] = { ...copy[foundIndex], status };
        return copy;
      }
      return [...prev, { id: `local-${date}`, userId: selectedUserId, date, status } as Presence];
    });

    try {
      await api.post('/presence', { userId: selectedUserId, date, status });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('staff.presence.saveFailedError'));
      // revert to authoritative server state
      load();
    }
  }

  function statusForDay(day: number): PresenceStatus | null {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day).toISOString().slice(0, 10);
    const found = presences.find((p) => p.date.slice(0, 10) === date);
    return found ? found.status : null;
  }

  function isOnVacation(day: number): boolean {
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    return vacations.some((v) => date >= new Date(v.startDate) && date <= new Date(v.endDate));
  }

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 32 }} />;

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.label}>{t('staff.presence.staffMember')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {users.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={[styles.userChip, selectedUserId === u.id && styles.userChipActive]}
            onPress={() => setSelectedUserId(u.id)}
          >
            <Text style={[styles.userChipText, selectedUserId === u.id && styles.userChipTextActive]}>
              {u.firstName} {u.lastName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>
        {monthStart.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
      </Text>

      <View style={styles.calendarGrid}>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const status = statusForDay(day);
          const onVacation = isOnVacation(day);
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayCell,
                onVacation && styles.dayCellVacation,
                status === 'present' && styles.dayCellPresent,
                status === 'absent' && styles.dayCellAbsent,
                status === 'late' && styles.dayCellLate,
                status === 'sick' && styles.dayCellSick,
              ]}
              onPress={() => {
                // cycle through statuses on tap: present -> absent -> late -> sick -> present
                const order: PresenceStatus[] = ['present', 'absent', 'late', 'sick'];
                const next = order[(order.indexOf(status as PresenceStatus) + 1) % order.length] || 'present';
                setDayStatus(day, next);
              }}
            >
              <Text style={styles.dayCellText}>{day}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.hint}>{t('staff.presence.hint')}</Text>

      <Text style={styles.sectionTitle}>{t('staff.presence.vacationPeriods')}</Text>
      {vacations.length === 0 && <Text style={styles.empty}>{t('staff.presence.noVacation')}</Text>}
      {vacations.map((v) => (
        <View key={v.id} style={styles.card}>
          <Text style={styles.cardTitle}>
            {new Date(v.startDate).toLocaleDateString()} → {new Date(v.endDate).toLocaleDateString()}
          </Text>
          <Text style={styles.cardMeta}>
            {v.type} · {v.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  subTabRow: { flexDirection: 'row', padding: 12, gap: 8 },
  subTabButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#f0f0f0' },
  subTabButtonActive: { backgroundColor: '#111' },
  subTabText: { fontSize: 13, fontWeight: '600', color: '#333' },
  subTabTextActive: { color: '#fff' },
  error: { color: '#dc2626', textAlign: 'center', marginVertical: 8 },
  empty: { textAlign: 'center', color: '#888', marginTop: 16 },
  card: { backgroundColor: '#f7f7f9', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row' },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardMeta: { fontSize: 12, color: '#888', marginTop: 2 },
  cardActions: { justifyContent: 'space-around', gap: 6, marginLeft: 8 },
  actionLink: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
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
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  roleChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#f0f0f0' },
  roleChipActive: { backgroundColor: '#2563eb' },
  roleChipText: { fontSize: 13, color: '#333', textTransform: 'capitalize' },
  roleChipTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  primaryButton: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: { paddingVertical: 10, paddingHorizontal: 18 },
  secondaryButtonText: { color: '#666', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  userChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#f0f0f0', marginRight: 8 },
  userChipActive: { backgroundColor: '#111' },
  userChipText: { fontSize: 13, color: '#333' },
  userChipTextActive: { color: '#fff' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellText: { fontSize: 13, fontWeight: '600' },
  dayCellPresent: { backgroundColor: '#bbf7d0' },
  dayCellAbsent: { backgroundColor: '#fecaca' },
  dayCellLate: { backgroundColor: '#fde68a' },
  dayCellSick: { backgroundColor: '#fbcfe8' },
  dayCellVacation: { borderWidth: 2, borderColor: '#a855f7' },
  hint: { fontSize: 11, color: '#888', marginTop: 8, marginBottom: 16 },
});
