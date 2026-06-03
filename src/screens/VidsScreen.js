import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');
const YOUTUBE_API_KEY = 'AIzaSyCJwhiQbImxQr6P-mTqZdx0n5xNKJN3WSE'; // Replace with your real key

async function fetchShorts() {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=shorts&type=video&videoDuration=short&key=${YOUTUBE_API_KEY}`
  );
  const data = await res.json();
  return (data.items || []).map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.high.url,
  }));
}

function ShortCard({ item, isActive }) {
  return (
    <View style={styles.shortCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.shortImage} />
      <View style={styles.shortOverlay}>
        <Text style={styles.shortTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.shortChannel}>{item.channel}</Text>
        <View style={styles.shortActions}>
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="heart-outline" size={28} color="#FFF" /><Text style={styles.actionText}>12K</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="chatbubble-outline" size={28} color="#FFF" /><Text style={styles.actionText}>1.2K</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-outline" size={28} color="#FFF" /><Text style={styles.actionText}>Share</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function VidsScreen() {
  const [shorts, setShorts] = useState([]);

  useEffect(() => {
    fetchShorts().then(setShorts);
  }, []);

  return (
    <FlatList
      data={shorts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ShortCard item={item} />}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={height}
      decelerationRate="fast"
      style={{ backgroundColor: '#000' }}
    />
  );
}

const styles = StyleSheet.create({
  shortCard: { width, height, justifyContent: 'flex-end' },
  shortImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  shortOverlay: { padding: 20, paddingBottom: 40 },
  shortTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  shortChannel: { color: '#CCC', fontSize: 13, marginBottom: 16 },
  shortActions: { flexDirection: 'row', gap: 24 },
  actionBtn: { alignItems: 'center' },
  actionText: { color: '#FFF', fontSize: 12, marginTop: 4 },
});
