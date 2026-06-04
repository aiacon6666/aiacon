import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, ActivityIndicator, View, Text, RefreshControl } from 'react-native';
import { fetchPosts } from '../services/backend';
import { fetchLongYouTubeVideos } from '../services/music';
import PostCard from './PostCard';
import YouTubeBroadcastCard from './YouTubeBroadcastCard';
import { colors } from '../theme/colors';

const ForYouFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (refresh = false) => {
    if (!refresh && !hasMore) return;
    setLoading(true);
    try {
      // Fetch user posts
      const { posts: newPosts, lastVisible } = await fetchPosts(refresh ? null : lastDoc);
      let combined = refresh ? newPosts : [...posts, ...newPosts];
      
      // If combined is empty or very few, fetch YouTube videos
      if (combined.length < 5) {
        const youtubeVideos = await fetchLongYouTubeVideos(10);
        const youtubeItems = youtubeVideos.map(video => ({
          id: `yt_${video.id}`,
          type: 'youtube_broadcast',
          videoData: video,
        }));
        // Merge: user posts first, then YouTube
        combined = [...combined, ...youtubeItems];
      }
      
      setPosts(combined);
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
    loadPosts(true);
  }, []);

  useEffect(() => {
    loadPosts(true);
  }, []);

  const renderItem = ({ item }) => {
    if (item.type === 'youtube_broadcast') {
      return (
        <YouTubeBroadcastCard
          video={item.videoData}
          onLike={() => {}}
          onRepost={() => {}}
          onComment={() => {}}
          onShare={() => {}}
          onMenu={() => {}}
        />
      );
    }
    return <PostCard post={item} onUpdate={() => loadPosts(true)} />;
  };

  if (loading && posts.length === 0) {
    return <ActivityIndicator size="large" color={colors.lavender} style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.lavender} />}
      onEndReached={() => loadPosts()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading && posts.length > 0 ? <ActivityIndicator size="small" color={colors.lavender} style={{ margin: 20 }} /> : null}
      ListEmptyComponent={<View style={{ padding: 20 }}><Text style={{ color: colors.text, textAlign: 'center' }}>No posts yet. Check back later!</Text></View>}
    />
  );
};

export default ForYouFeed;
