import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { fetchTrendingShorts, fetchVideoDetails } from '../services/music';

const { width, height } = Dimensions.get('window');

const VidsScreen = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const shorts = await fetchTrendingShorts('US', 20);
      const enriched = await Promise.all(
        shorts.map(async (video) => {
          const details = await fetchVideoDetails(video.id);
          return {
            ...video,
            duration: details?.contentDetails?.duration,
            views: details?.statistics?.viewCount,
          };
        })
      );
      setVideos(enriched);
    } catch (error) {
      console.error('Error loading shorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const renderItem = ({ item, index }) => {
    // YouTube embed URL – plays inline, no controls overlay (we overlay our own UI)
    const embedUrl = `https://www.youtube.com/embed/${item.id}?autoplay=${index === currentIndex ? 1 : 0}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
    return (
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.webview}
          allowsFullscreenVideo={false}
          allowsInlineMediaPlayback={true}
          javaScriptEnabled={true}
          onError={(e) => console.log('WebView error', e)}
        />
        {/* Overlay UI */}
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Text style={styles.username}>@{item.channelTitle.replace(/\s/g, '')}</Text>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="repeat-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Repost</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Thoughts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={28} color="#fff" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="ellipsis-horizontal" size={28} color="#fff" />
              <Text style={styles.actionText}>More</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#9F7AEA" />
        <Text style={styles.loaderText}>Loading Vids...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={height}
        decelerationRate="fast"
      />
    </SafeAreaView>
  );
};

const styles = {
  container: { flex: 1, backgroundColor: '#000' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  loaderText: { color: '#9F7AEA', marginTop: 10, fontSize: 16, fontFamily: 'FiraCode-Regular' },
  videoContainer: { width, height, backgroundColor: '#000', position: 'relative' },
  webview: { flex: 1, backgroundColor: '#000' },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'space-between', paddingTop: 60, paddingBottom: 80, paddingHorizontal: 16,
  },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  username: {
    color: '#fff', fontSize: 18, fontWeight: '600', fontFamily: 'FiraCode-Regular',
    textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
  followButton: { backgroundColor: '#5B4BFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  followText: { color: '#fff', fontWeight: '600', fontSize: 14, fontFamily: 'FiraCode-Regular' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  actionButton: { alignItems: 'center' },
  actionText: {
    color: '#fff', fontSize: 12, marginTop: 4, fontFamily: 'FiraCode-Regular',
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
  },
};

export default VidsScreen;
