import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getOrCreateConversation } from '../services/backend';
import { db } from '../services/backend';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { colors } from '../theme/colors';

const NewConversationScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = async () => {
    if (searchQuery.length < 2) return;
    setLoading(true);
    const q = query(collection(db, 'users'), where('username', '>=', searchQuery), where('username', '<=', searchQuery + '\uf8ff'), limit(10));
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(u => u.id !== user.uid);
    setResults(users);
    setLoading(false);
  };

  const startChat = async (otherUser) => {
    const convId = await getOrCreateConversation(user.uid, otherUser.id);
    navigation.navigate('Chat', { conversationId: convId, otherUser });
  };

  return (
    <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.lavender} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>New Message</Text>
        </View>
        <TextInput
          style={{ backgroundColor: colors.card, borderRadius: 20, padding: 10, color: colors.text, marginBottom: 12 }}
          placeholder="Search by username..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchUsers}
        />
        {loading && <ActivityIndicator size="small" color={colors.lavender} />}
        <FlatList
          data={results}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => startChat(item)} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="person-circle" size={40} color={colors.lavender} />
              <View style={{ marginLeft: 12 }}>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>@{item.username}</Text>
                <Text style={{ color: colors.textSecondary }}>{item.fullName || ''}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          ListEmptyComponent={searchQuery.length > 0 && !loading && <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>No users found</Text>}
        />
      </View>
    </LinearGradient>
  );
};

export default NewConversationScreen;
