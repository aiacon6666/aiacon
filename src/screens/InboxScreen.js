import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserConversations } from '../services/backend';
import { colors } from '../theme/colors';

const InboxScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    const data = await getUserConversations(user.uid);
    setConversations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
    // Listen for new conversations? Not needed – pull-to-refresh covers.
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, []);

  const openChat = (conversation) => {
    navigation.navigate('Chat', { conversationId: conversation.id, otherUser: conversation.otherUser });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openChat(item)} style={{ backgroundColor: colors.card, marginHorizontal: 12, marginVertical: 6, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        {item.otherUser?.profilePicture ? (
          <Image source={{ uri: item.otherUser.profilePicture }} style={{ width: 50, height: 50, borderRadius: 25 }} />
        ) : (
          <Ionicons name="person" size={30} color={colors.lavender} />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>@{item.otherUser?.username || 'user'}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>{item.lastMessage || 'Tap to start chatting'}</Text>
      </View>
      {item.lastMessageAt && (
        <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{new Date(item.lastMessageAt.toDate()).toLocaleDateString()}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" color={colors.lavender} style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', fontFamily: 'FiraCode-Regular' }}>Inbox</Text>
          <TouchableOpacity onPress={() => navigation.navigate("NewConversation")} style={{ position: "absolute", right: 16, top: 16 }}>
            <Ionicons name="create-outline" size={28} color={colors.lavender} />
          </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lavender} />}
        ListEmptyComponent={<Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>No conversations yet. Start chatting from a profile!</Text>}
      />
    </LinearGradient>
  );
};

export default InboxScreen;
