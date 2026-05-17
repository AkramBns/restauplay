import { useAuth } from '@/utils/auth-context';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_ENDPOINTS } from '@/constants/api';
import { getAccessToken } from '@/utils/auth';

export default function ModalScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { employeeId } = useAuth();

  const [formData, setFormData] = useState({
    id: params.id ? Number(params.id) : 0,
    itemId: params.itemId ? Number(params.itemId) : 0,  // ← add this
    name: params.name ? String(params.name) : '',
    description: params.description ? String(params.description) : '',
    state: params.state ? String(params.state) : 'pending',
    quantity: params.quantity ? Number(params.quantity) : 1,
    unit: params.unit ? String(params.unit) : '',
  });

  // --- Autocomplete state ---
  const [isSearching, setIsSearching] = useState(false);         // ✅ add
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [suggestions, setSuggestions] = useState<{ id: number; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const nameInputRef = useRef<TextInput>(null);

  // Cleanup on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleNameChange = (text: string) => {
      setFormData(prev => ({ ...prev, name: text }));

      // Clear previous debounce timer
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (text.length < 2) {          // don't search for 0–1 chars
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Wait 300ms after user stops typing, then hit the server
      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const token = await getAccessToken();
          const response = await fetch(
            `${API_ENDPOINTS.itmes}?search=${encodeURIComponent(text)}&limit=6`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.ok) {
            const data: { id: number; name: string }[] = await response.json();

            setSuggestions(data);
            setShowSuggestions(data.length > 0);
          }
        } catch (e) {
          console.log('Autocomplete search failed:', e);
        } finally {
          setIsSearching(false);
        }
    }, 300);
  };

const handleSelectSuggestion = (item: { id: number; name: string }) => {
  setFormData(prev => ({ ...prev, name: item.name, itemId: item.id }));
  setSuggestions([]);
  setShowSuggestions(false);
  nameInputRef.current?.blur();
};

  // --- Rest of handlers (unchanged) ---
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    try {
        const token = await getAccessToken();
        const method = formData.id ? 'PUT' : 'POST';
        const url = formData.id
          ? `${API_ENDPOINTS.transactions}/${formData.id}`
          : API_ENDPOINTS.transactions;
        const payload = { ...formData, employee_id: employeeId };
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          router.back();
        } else {
          const text = await response.text();
          alert('Failed to save item: ' + text);
        }
      } catch (error) {
        alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      state:
        prev.state === 'pending' ? 'credit'
        : prev.state === 'credit' ? 'completed'
        : 'pending',
    }));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // ← crucial: lets taps reach suggestions
      >
        <ThemedText type="title">{formData.id ? 'Edit Item' : 'New Item'}</ThemedText>

        {/* Name field with autocomplete */}
        <View style={styles.formGroup}>
          <ThemedText type="subtitle">Name</ThemedText>
          <View>
            <TextInput
              ref={nameInputRef}
              style={styles.input}
              value={formData.name}
              onChangeText={handleNameChange}
              placeholder="Enter item name"
              placeholderTextColor="#999"
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            />
            {isSearching && (
              <ActivityIndicator
                size="small"
                color="#999"
                style={{ position: 'absolute', right: 12, top: 20 }}
              />
            )}
          </View>

          {showSuggestions && (
            <View style={styles.suggestionsBox}>
              <FlatList
                data={suggestions}
                keyExtractor={(item, i) => `${item}-${i}`}
                scrollEnabled={false}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.suggestionItem,
                      index < suggestions.length - 1 && styles.suggestionBorder,
                    ]}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    {/* Highlight the matching portion */}
                    <HighlightedText text={item.name} query={formData.name} />

                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="subtitle">Description</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Enter description"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        <View style={styles.rowContainer}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <ThemedText type="subtitle">Quantity</ThemedText>
            <TextInput
              style={styles.input}
              value={String(formData.quantity)}
              onChangeText={(text) => handleInputChange('quantity', text)}
              placeholder="Enter quantity"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 12 }]}>
            <ThemedText type="subtitle">Unit</ThemedText>
            <TextInput
              style={styles.input}
              value={formData.unit}
              onChangeText={(text) => handleInputChange('unit', text)}
              placeholder="kg, pcs, etc."
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="subtitle">Status</ThemedText>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: formData.state === 'completed' ? '#abf1ab' : '#fff8e1' },
            ]}
            onPress={toggleStatus}
          >
            <Text style={styles.statusText}>
              {formData.state === 'completed'
                ? '✅ Completed'
                : formData.state === 'credit'
                ? '💵 Credit'
                : '🕒 Pending'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <ThemedText style={styles.buttonText}>Save Changes</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// --- Helper component: bolds the matching substring ---
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <Text style={styles.suggestionText}>{text}</Text>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <Text style={styles.suggestionText}>{text}</Text>;

  return (
    <Text style={styles.suggestionText}>
      {text.slice(0, index)}
      <Text style={styles.suggestionMatch}>{text.slice(index, index + query.length)}</Text>
      {text.slice(index + query.length)}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContent: { paddingVertical: 20 },
  formGroup: { marginBottom: 20 },
  rowContainer: { flexDirection: 'row', gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  // Autocomplete dropdown
  suggestionsBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  suggestionItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 15,
    color: '#222',
  },
  suggestionMatch: {
    fontWeight: '700',
    color: '#007AFF',
  },
  // Rest unchanged
  statusButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  statusText: { fontSize: 16, fontWeight: '500' },
  buttonGroup: { flexDirection: 'row', gap: 12, marginTop: 30 },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#000' },
});