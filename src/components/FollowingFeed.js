import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, ActivityIndicator, View, Text, RefreshControl } from 'react-native';
import { fetchPosts, getFollowingList } from '../services/backend';
import PostCard from './PostCard';
import { colors } from '../theme/colors';

const FollowingFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);

  const loadFollowingList = async () => {
    const ids = await getFollowingList();
    setFollowingIds(ids);
    return ids;
  };

  const loadPosts = async (refresh = false) => {
    if (!refresh && !hasMore) return;
    setLoading(true);
    try {
      let ids = followingIds;
      if (ids.length === 0) ids = await loadFollowingList();
      if (ids.length === 0) {
        setPosts([]);
        setHasMore(false);
        setLoading(false);
        return;
      }
      const { posts: newPosts, lastVisible } = await fetchPosts(refresh ? null : lastDoc, ids);
      if (refresh) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      setLastDoc(lastVisible);
      setHasMore(newPosts.length > 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFollowingList().then(() => loadPosts(true));
  }, []);

  useEffect(() => {
    loadFollowingList().then(() => loadPosts(true));
  }, []);

  if (loading && posts.length === 0) {
    return <ActivityIndicator size="large" color={colors.lavender} style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} onUpdate={() => loadPosts(true)} />}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lavender} />}
      onEndReached={() => loadPosts()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading && posts.length > 0 ? <ActivityIndicator size="small" color={colors.lavender} style={{ margin: 20 }} /> : null}
      ListEmptyComponent={<View style={{ padding: 20 }}><Text style={{ color: colors.text, textAlign: 'center' }}>You aren't following anyone yet. Follow some creators!</Text></View>}
    />
  );
};

export default FollowingFeed;
