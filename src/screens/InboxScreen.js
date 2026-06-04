import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import Colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { listenNotifications } from '../services/backend';
import SectionTabs from '../components/SectionTabs';

const TABS = ['Messages', 'Notifications', 'Squads'];

function NotificationsTab() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    if (!user) return;
    const unsub = listenNotifications(user.uid, setNotifs);
    return unsub;
  }, [user]);

  const iconMap = { like: '❤️', follow: '👤', repost: '🔁', comment: '💬', gift: '💜' };

  if (!notifs.length) {
    return (
      <View style={{ alignItems: 'center', paddingTop: 40 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 15, fontFamily: 'FiraCode-Regular' }}>No notifications yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={notifs}
      keyExtractor={item => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.notifItem}>
          <Text style={styles.notifIcon}>{iconMap[item.type] || '🔔'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.notifText}>
              <Text style={{ fontWeight: '700' }}>@{item.fromUid?.slice(0, 6)}</Text> {item.message}
            </Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
      )}
    />
  );
}

function MessagesTab({ navigation }) {
  // Mock conversations – replace with real data from Firestore later
  const mockConversations = [
    { id: '1', name: 'Snaluca Team', avatar: 'https://ui-avatars.com/api/?name=ST&background=0047AB&color=fff', lastMessage: 'Welcome to AiaCon!', time: 'now' },
    { id: '2', name: 'AiaCon Bot', avatar: 'https://ui-avatars.com/api/?name=AI&background=3F0D6C&color=fff', lastMessage: 'How can I help you today?', time: '1m' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={mockConversations}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.convItem}
            onPress={() => navigation.navigate('Chat', { convId: item.id, name: item.name })}
          >
            <FastImage source={{ uri: item.avatar }} style={styles.convAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.convName}>{item.name}</Text>
              <Text style={styles.convLastMsg} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.convTime}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.newConvFab} onPress={() => navigation.navigate('NewConversation')}>
        <Ionicons name="create-outline" size={24} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

function SquadsTab({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 40, marginBottom: 14, fontFamily: 'FiraCode-Regular' }}>👥</Text>
      <Text style={{ color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8, fontFamily: 'FiraCode-Regular' }}>Your Squads</Text>
      <Text style={{ color: Colors.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 40, fontFamily: 'FiraCode-Regular' }}>
        Create or join squads to chat with your crew.
      </Text>
      <TouchableOpacity style={[styles.newConvFab, { position: 'relative', marginTop: 24 }]} onPress={() => navigation.navigate('Squads')}>
        <Ionicons name="add" size={24} color={Colors.text} />
      </TouchableOpacity>
    </View>
  );
}

function InboxScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Inbox</Text>
      <SectionTabs tabs={TABS} active={activeTab} onSelect={setActiveTab} />
      <View style={{ flex: 1 }}>
        {activeTab === 0 && <MessagesTab navigation={navigation} />}
        {activeTab === 1 && <NotificationsTab />}
        {activeTab === 2 && <SquadsTab navigation={navigation} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { color: Colors.text, fontSize: 22, fontWeight: '800', padding: 16, paddingBottom: 8, fontFamily: 'FiraCode-Regular' },
  notifItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
  },
  notifIcon: { fontSize: 22, marginRight: 12 },
  notifText: { color: Colors.text, fontSize: 14, lineHeight: 20, fontFamily: 'FiraCode-Regular' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  convItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  convAvatar: { width: 46, height: 46, borderRadius: 23, marginRight: 12 },
  convName: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 3, fontFamily: 'FiraCode-Regular' },
  convLastMsg: { color: Colors.textSecondary, fontSize: 13, fontFamily: 'FiraCode-Regular' },
  convTime: { color: Colors.textSecondary, fontSize: 11, marginLeft: 8, fontFamily: 'FiraCode-Regular' },
  newConvFab: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: Colors.primary, borderRadius: 28,
    width: 56, height: 56, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.6, shadowRadius: 8,
    elevation: 8,
  },
});

export default InboxScreen;
