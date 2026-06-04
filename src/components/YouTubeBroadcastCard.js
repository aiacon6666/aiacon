import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

function YouTubeBroadcastCard({ video }) {
  function openVideo() {
    const url = 'https://www.youtube.com/watch?v=' + video.id;
    Linking.openURL(url);
  }

  return (
    <TouchableOpacity style={styles.card} onPress={openVideo}>
      <View style={styles.thumbContainer}>
        <FastImage source={{ uri: video.thumbnail }} style={styles.thumb} resizeMode={FastImage.resizeMode.cover} />
        <View style={styles.playOverlay}>
          <Ionicons name="logo-youtube" size={36} color="#FF0000" />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration || 'LIVE'}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.channel}>{video.channelTitle}</Text>
        <View style={styles.stats}>
          <Ionicons name="eye-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.statsText}>{video.viewCount || '—'} views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbContainer: {
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.border,
  },
  playOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    padding: 10,
  },
  title: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  channel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statsText: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginLeft: 4,
  },
});

export default YouTubeBroadcastCard;
