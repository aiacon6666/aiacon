import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import GeminiLive from '../components/GeminiLive';
import SectionTabs from '../components/SectionTabs';

const TABS = ['AI Chat', 'Generate', 'Search'];

function GeneratePlaceholder() {
  return (
    <View style={styles.generateWrap}>
      <View style={styles.generateCard}>
        <Text style={styles.generateEmoji}>🎨</Text>
        <Text style={styles.generateTitle}>AI Image Generation</Text>
        <Text style={styles.generateSub}>Coming soon. Power your creativity with Gemini Imagen.</Text>
      </View>
      <View style={styles.generateCard}>
        <Text style={styles.generateEmoji}>🎬</Text>
        <Text style={styles.generateTitle}>AI Video Generation</Text>
        <Text style={styles.generateSub}>Short-form AI video creation — launching soon.</Text>
      </View>
    </View>
  );
}

function SearchTab() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  async function handleSearch() {
    if (!query.trim()) return;
    setResults([
      { id: '1', label: `AI result for: ${query}` },
      { id: '2', label: `Users matching: ${query}` },
      { id: '3', label: `Posts about: ${query}` },
    ]);
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.searchInputWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search AiaCon..."
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
      {results.map(r => (
        <View key={r.id} style={styles.resultItem}>
          <Ionicons name="sparkles-outline" size={16} color={Colors.accent} />
          <Text style={styles.resultText}>{r.label}</Text>
        </View>
      ))}
    </View>
  );
}

function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState(0);

  function renderContent() {
    if (activeTab === 0) return <GeminiLive />;
    if (activeTab === 1) return <GeneratePlaceholder />;
    if (activeTab === 2) return <SearchTab />;
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Discover</Text>
      <SectionTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />
      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { color: Colors.text, fontSize: 22, fontWeight: '800', padding: 16, paddingBottom: 8, fontFamily: 'FiraCode-Regular' },
  generateWrap: { padding: 16 },
  generateCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginBottom: 14,
    borderWidth: 1, borderColor: Colors.border, alignItems: 'center',
  },
  generateEmoji: { fontSize: 40, marginBottom: 10 },
  generateTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: 6, fontFamily: 'FiraCode-Regular' },
  generateSub: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', fontFamily: 'FiraCode-Regular' },
  searchInputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 16,
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, marginLeft: 8, fontFamily: 'FiraCode-Regular' },
  resultItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  resultText: { color: Colors.text, fontSize: 14, marginLeft: 10, fontFamily: 'FiraCode-Regular' },
});

export default DiscoverScreen;
