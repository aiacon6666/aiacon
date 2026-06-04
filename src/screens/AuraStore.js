import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const STORE_ITEMS = [
  { id: '1', name: 'Neon Halo', emoji: '👾', cost: 100, description: 'A glowing neon halo for your avatar' },
  { id: '2', name: 'Cyber Wings', emoji: '🦋', cost: 200, description: 'Luminescent cyber wings' },
  { id: '3', name: 'Cosmic Crown', emoji: '👑', cost: 350, description: 'Wear the crown of the cosmos' },
  { id: '4', name: 'Aura Shield', emoji: '🛡️', cost: 150, description: 'Protective Aura force field' },
  { id: '5', name: 'Star Trail', emoji: '⭐', cost: 80, description: 'Leave a trail of stars' },
  { id: '6', name: 'Void Cloak', emoji: '🌑', cost: 500, description: 'Become one with the void' },
];

function AuraStore({ navigation }) {
  const { profile } = useAuth();

  function handleBuy(item) {
    const aura = profile ? (profile.aura || 0) : 0;
    if (aura < item.cost) {
      Alert.alert('Not enough Aura', `You need ${item.cost} Aura to unlock this item. Current: ${aura}`);
      return;
    }
    Alert.alert('Purchase', `Unlock ${item.name} for ${item.cost} Aura?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Buy', onPress: () => Alert.alert('Unlocked!', `${item.name} is now in your vault.`) },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>✨ Aura Store</Text>
        <View style={styles.auraChip}>
          <Text style={styles.auraChipText}>{profile ? (profile.aura || 0) : 0} ✨</Text>
        </View>
      </View>

      <FlatList
        data={STORE_ITEMS}
        numColumns={2}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleBuy(item)}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.costRow}>
              <Text style={styles.costText}>{item.cost} ✨</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
  auraChip: { backgroundColor: Colors.secondary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  auraChipText: { color: Colors.text, fontWeight: '700', fontSize: 13, fontFamily: 'FiraCode-Regular' },
  grid: { padding: 12 },
  card: {
    flex: 1, margin: 6, backgroundColor: Colors.card,
    borderRadius: 16, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  itemEmoji: { fontSize: 40, marginBottom: 8 },
  itemName: { color: Colors.text, fontWeight: '700', fontSize: 14, marginBottom: 4, textAlign: 'center', fontFamily: 'FiraCode-Regular' },
  itemDesc: { color: Colors.textSecondary, fontSize: 11, textAlign: 'center', marginBottom: 10, fontFamily: 'FiraCode-Regular' },
  costRow: { backgroundColor: Colors.secondary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  costText: { color: Colors.text, fontWeight: '700', fontSize: 12, fontFamily: 'FiraCode-Regular' },
});

export default AuraStore;
