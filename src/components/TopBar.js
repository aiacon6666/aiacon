import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TopBar({ onSearchPress }) {
  return (
    <LinearGradient colors={['#0047AB', '#1A0033']} style={styles.container}>
      <View style={{ width: 24 }} />
      <Text style={styles.title}>AIACON</Text>
      <TouchableOpacity onPress={onSearchPress}>
        <Ionicons name="search" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
});
