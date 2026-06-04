import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, ActivityIndicator, View, StyleSheet, RefreshControl, Text } from 'react-native';
import PostCard from './PostCard';
import { fetchPosts } from '../services/backend';
import Colors from '../theme/colors';

function ForYouFeed() {
  const [posts, setPosts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);
    const result = await fetchPosts(null, 10);
    setPosts(result.posts);
    setLastDoc(result.lastDoc);
    setHasMore(result.posts.length === 10);
    setLoading(false);
  }

  async function loadMore() {
    if (!hasMore || loading) return;
    setLoading(true);
    const result = await fetchPosts(lastDoc, 10);
    setPosts(prev => [...prev, ...result.posts]);
    setLastDoc(result.lastDoc);
    setHasMore(result.posts.length === 10);
    setLoading(false);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const result = await fetchPosts(null, 10);
    setPosts(result.posts);
    setLastDoc(result.lastDoc);
    setHasMore(result.posts.length === 10);
    setRefreshing(false);
  }, []);

  function renderItem({ item }) {
    return <PostCard post={item} />;
  }

  function renderFooter() {
    if (!loading) return null;
    return <ActivityIndicator color={Colors.accent} style={{ marginVertical: 20 }} />;
  }

  function renderEmpty() {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No posts yet. Be the first! 🚀</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      getItemLayout={(data, index) => ({ length: 300, offset: 300 * index, index })}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      showsVerticalScrollIndicator={false}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
});

export default ForYouFeed;
