import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, ActivityIndicator, View, StyleSheet, RefreshControl, Text } from 'react-native';
import PostCard from './PostCard';
import { fetchFollowingPosts } from '../services/backend';
import { useAuth } from '../context/AuthContext';
import Colors from '../theme/colors';

function FollowingFeed() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitial();
  }, [profile]);

  async function loadInitial() {
    setLoading(true);
    const following = profile && profile.following ? profile.following : [];
    const result = await fetchFollowingPosts(following, null, 10);
    setPosts(result.posts);
    setLastDoc(result.lastDoc);
    setLoading(false);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInitial();
    setRefreshing(false);
  }, [profile]);

  async function loadMore() {
    if (loading) return;
    setLoading(true);
    const following = profile && profile.following ? profile.following : [];
    const result = await fetchFollowingPosts(following, lastDoc, 10);
    setPosts(prev => [...prev, ...result.posts]);
    setLastDoc(result.lastDoc);
    setLoading(false);
  }

  if (!profile || !profile.following || profile.following.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Follow people</Text>
        <Text style={styles.emptyText}>Posts from people you follow will appear here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <PostCard post={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={loading ? <ActivityIndicator color={Colors.accent} style={{ margin: 20 }} /> : null}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: Colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FollowingFeed;
