import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Colors from '../theme/colors';
import { YOUTUBE_API_KEY } from '../config/keys';
import FastImage from 'react-native-fast-image';

const SCREEN_H = Dimensions.get('window').height;
const SCREEN_W = Dimensions.get('window').width;

function VideoItem({ video, isFocused }) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.videoContainer}>
      {isFocused ? (
        <WebView
          style={styles.player}
          source={{ uri: `https://www.youtube.com/embed/${video.id}?autoplay=1&controls=0&playsinline=1&rel=0` }}
          allowsFullscreenVideo
          javaScriptEnabled
          mediaPlaybackRequiresUserAction={false}
        />
      ) : (
        <FastImage source={{ uri: video.thumbnail }} style={styles.player} resizeMode={FastImage.resizeMode.cover} />
      )}

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.authorInfo}>
          <Text style={styles.channelName}>{video.channelTitle}</Text>
          <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionItem} onPress={() => setLiked(!liked)}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={28} color={liked ? '#FF4466' : Colors.text} />
            <Text style={styles.actionLabel}>{video.likeCount || '—'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={26} color={Colors.text} />
            <Text style={styles.actionLabel}>Thoughts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <MaterialCommunityIcons name="repeat" size={26} color={Colors.text} />
            <Text style={styles.actionLabel}>Repost</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Feather name="share-2" size={24} color={Colors.text} />
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
            <Text style={styles.actionLabel}>More</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.followBtn}>
        <Text style={styles.followText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );
}

function VidsScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchShorts();
  }, []);

  async function fetchShorts() {
    try {
      const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          type: 'video',
          videoDuration: 'short',
          maxResults: 15,
          q: 'viral trending short',
          key: YOUTUBE_API_KEY,
          order: 'viewCount',
        },
      });
      const items = res.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high.url,
      }));
      setVideos(items);
    } catch (e) {
      console.log('YouTube fetch error', e.message);
      setVideos([
        { id: 'dQw4w9WgXcQ', title: 'Sample Short 1', channelTitle: 'AiaCon', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
        { id: '9bZkp7q19f0', title: 'Sample Short 2', channelTitle: 'Snaluca', thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onViewableChanged({ viewableItems }) {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={videos}
        keyExtractor={item => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
        renderItem={({ item, index }) => <VideoItem video={item} isFocused={index === currentIndex} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingWrap: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  videoContainer: { width: SCREEN_W, height: SCREEN_H, backgroundColor: '#000' },
  player: { width: '100%', height: '100%', backgroundColor: '#000' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-end', padding: 16, paddingBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  authorInfo: { flex: 1, marginRight: 12 },
  channelName: { color: Colors.text, fontWeight: '700', fontSize: 14, marginBottom: 4, fontFamily: 'FiraCode-Regular' },
  videoTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18, fontFamily: 'FiraCode-Regular' },
  actions: { alignItems: 'center' },
  actionItem: { alignItems: 'center', marginBottom: 18 },
  actionLabel: { color: Colors.text, fontSize: 11, marginTop: 3, fontFamily: 'FiraCode-Regular' },
  followBtn: { position: 'absolute', top: 60, right: 16, borderWidth: 1.5, borderColor: Colors.text, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  followText: { color: Colors.text, fontSize: 12, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default VidsScreen;
