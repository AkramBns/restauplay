import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { API_ENDPOINTS } from '@/constants/api';
import { getAccessToken } from '@/utils/auth';

export default function ModalScreen() {
  
  const params = useLocalSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: params.id ? Number(params.id) : 0,
    name: params.name ? String(params.name) : '',
    description: params.description ? String(params.description) : '',
    state: params.state ? String(params.state) : 'pending',
    quantity: params.quantity ? Number(params.quantity) : 1,
    unit: params.unit ? String(params.unit) : '',
  });

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
        console.log('Submitting data:', formData, 'to URL:', url, 'with method:', method);
        const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.back();
      } else {
        const text = await response.text();
        alert('Failed to save item : ' + (response.status ? `: ${text}` : ''));
      }
    } catch (error) {
      console.log('Submitting data failed :', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      state: prev.state === 'pending' ? 'credit' : prev.state === 'credit' ? 'completed' : 'pending',
    }));
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title">{formData.id ? 'Edit Item' : 'New Item'}</ThemedText>

        <View style={styles.formGroup}>
          <ThemedText type="subtitle">Name</ThemedText>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="Enter item name"
            placeholderTextColor="#999"
          />
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
              placeholder="Enter unit (kg, pcs, etc.)"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <ThemedText type="subtitle">Status</ThemedText>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: formData.state === 'completed' ? '#abf1ab' : '#fff8e1' }
            ]}
            onPress={toggleStatus}
          >
            <Text style={styles.statusText}>
              {
                formData.state === 'completed'
                  ? '✅ Completed'
                  : formData.state === 'credit'
                    ? '💵 Credit'
                    : '🕒 Pending'
              }
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
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
  statusButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
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
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
