import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { fetchCommunities, joinCommunity, leaveCommunity } from '../services/backend';
import { useAuth } from '../context/AuthContext';

function CommunitiesScreen({ navigation }) {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunities();
  }, []);

  async function loadCommunities() {
    setLoading(true);
    try {
      const comms = await fetchCommunities();
      setCommunities(comms);
    } catch (e) {
      console.log('fetchCommunities error', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinLeave(comm) {
    if (!user) return;
    const isMember = comm.members && comm.members.includes(user.uid);
    if (isMember) {
      await leaveCommunity(comm.id, user.uid);
    } else {
      await joinCommunity(comm.id, user.uid);
    }
    loadCommunities();
  }

  if (loading) {
    return <ActivityIndicator color={Colors.accent} style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={communities}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏘️</Text>
            <Text style={styles.emptyTitle}>No communities yet</Text>
            <Text style={styles.emptySub}>Be the first to create one!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isMember = user && item.members && item.members.includes(user.uid);
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('CommunityFeed', { community: item })}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>{item.emoji || '🌐'}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardMembers}>{item.members ? item.members.length : 0} members</Text>
              </View>
              <TouchableOpacity
                style={[styles.joinBtn, isMember && styles.leaveBtn]}
                onPress={() => handleJoinLeave(item)}
              >
                <Text style={styles.joinBtnText}>{isMember ? 'Leave' : 'Join'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 14 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 6, fontFamily: 'FiraCode-Regular' },
  emptySub: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'FiraCode-Regular' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  cardIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardIconText: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardName: { color: Colors.text, fontWeight: '700', fontSize: 15, marginBottom: 2, fontFamily: 'FiraCode-Regular' },
  cardMembers: { color: Colors.textSecondary, fontSize: 12, fontFamily: 'FiraCode-Regular' },
  joinBtn: { borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  leaveBtn: { backgroundColor: Colors.primary },
  joinBtnText: { color: Colors.text, fontSize: 12, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default CommunitiesScreen;
