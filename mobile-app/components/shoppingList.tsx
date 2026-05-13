import { LegendList } from "@legendapp/list";
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ShoppingItem } from '@/types/types';
import { Link } from 'expo-router';


const ShoppingList = ({ items }: { items: ShoppingItem[] }) => {
const getRowBackground = (state: string) => {
  switch (state) {
    case 'completed':
      return '#abf1ab';
    case 'pending':
      return '#fff8e1';
    default:
      return '#ffffff';
  }
};
    const getStatusIcon = (state: string) => {
  switch (state) {
    case 'completed':
      return '✅';
    case 'pending':
      return '🕒';
     case  'Credit':
      return '💵'
    default:
      return '❓';
  }
};

  return (
    <ThemedView style={{ flex: 1 }}>
      <Link href="/modal" asChild>
        <TouchableOpacity style={styles.addButton}>
          <ThemedText style={styles.addButtonText}>+ Add New Item</ThemedText>
        </TouchableOpacity>
      </Link>
      <LegendList
       style={{ flex: 1 }}
        data={items}
        keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={[ styles.row,  { backgroundColor: getRowBackground(item.state) }  ]}>
          {/* Left side: name + description */}
          <ThemedView style={styles.stepContainer}>
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
                  >
                    <Link.Trigger>
                       <View style={ [styles.textContainer, { backgroundColor: getRowBackground(item.state) } ]}>
                           <Text style={[ styles.name,{ backgroundColor: getRowBackground(item.state) }]}>{getStatusIcon(item.state)} {item.name} </Text>
                        <Text style={[ styles.description,{ backgroundColor: getRowBackground(item.state) }]}>[ {item.state} ]  {item.description} {item.quantity} { item.unit}</Text>
                    </View>

                    </Link.Trigger>
                    </Link>
         </ThemedView>
         

          
        </View>
      )}
    />
    </ThemedView>
  );
};

export default ShoppingList;

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    margin: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#828080e1',
     borderRadius: 12, 
     marginBottom: 8,  
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#413f3f',
  },
  description0: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusIcon: {
    fontSize: 20,
    marginLeft: 12,
  }, stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
