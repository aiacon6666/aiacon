import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/backend';
import Colors from '../theme/colors';
import { createConversation } from '../services/backend';
import { useAuth } from '../context/AuthContext';

function NewConversationScreen({ navigation }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    if (search.trim().length < 2) return;
    setSearching(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '>=', search.trim()),
        where('username', '<=', search.trim() + '\uf8ff')
      );
      const snap = await getDocs(q);
      const users = [];
      snap.forEach(d => {
        if (d.id !== user.uid) users.push({ id: d.id, ...d.data() });
      });
      setResults(users);
    } catch (e) {
      console.log('search error', e);
    } finally {
      setSearching(false);
    }
  }

  async function startChat(targetUser) {
    const convId = await createConversation([user.uid, targetUser.id]);
    navigation.replace('Chat', { convId, name: targetUser.displayName || targetUser.username });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>New Message</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Ionicons name="search" size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {searching && <ActivityIndicator color={Colors.accent} style={{ marginTop: 20 }} />}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userItem} onPress={() => startChat(item)}>
            <View style={styles.userAvatar}>
              <Text style={{ color: Colors.text, fontWeight: '700', fontSize: 18, fontFamily: 'FiraCode-Regular' }}>
                {(item.displayName || item.username || 'U')[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{item.displayName || item.username}</Text>
              <Text style={styles.userHandle}>@{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { color: Colors.text, fontSize: 18, fontWeight: '700', marginLeft: 12, fontFamily: 'FiraCode-Regular' },
  searchRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  searchInput: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11,
    color: Colors.text, fontSize: 14, borderWidth: 1, borderColor: Colors.border,
    fontFamily: 'FiraCode-Regular',
  },
  searchBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 12 },
  userItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: Colors.card, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  userName: { color: Colors.text, fontSize: 15, fontWeight: '600', fontFamily: 'FiraCode-Regular' },
  userHandle: { color: Colors.textSecondary, fontSize: 12, fontFamily: 'FiraCode-Regular' },
});

export default NewConversationScreen;
