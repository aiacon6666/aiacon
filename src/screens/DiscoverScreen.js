import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DiscoverScreen({ onOpenChat }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) {
      // Will be connected to Groq API later
      onOpenChat(query);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search bar with mic */}
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ask AI anything..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.micBtn}>
          <Ionicons name="mic" size={24} color="#00FFFF" />
        </TouchableOpacity>
      </View>

      {/* AI Overview card placeholder */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AI Answer</Text>
        <Text style={styles.cardText}>Your answer will appear here.</Text>
        <TouchableOpacity style={styles.showMore} onPress={() => onOpenChat(query)}>
          <Text style={styles.showMoreText}>Show More →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Powered by Groq, Hugging Face, Gemini</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backBtn: { marginRight: 10 },
  input: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    color: '#FFF',
    fontSize: 16,
  },
  micBtn: { marginLeft: 10 },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#0047AB',
  },
  cardTitle: { color: '#00FFFF', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  cardText: { color: '#CCC', fontSize: 14, marginBottom: 12 },
  showMore: { alignSelf: 'flex-end' },
  showMoreText: { color: '#00FFFF', fontWeight: '600' },
  hint: { color: '#555', textAlign: 'center', fontSize: 12 },
});
