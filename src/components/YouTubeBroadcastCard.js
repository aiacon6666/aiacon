import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');
const VIDEO_HEIGHT = 300;

const YouTubeBroadcastCard = ({ video, onLike, onRepost, onComment, onShare, onMenu }) => {
  const [playing, setPlaying] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${video.id}?autoplay=0&controls=1&modestbranding=1&rel=0&playsinline=1`;

  return (
    <View style={{ backgroundColor: colors.card, marginBottom: 12, borderRadius: 12, overflow: 'hidden', marginHorizontal: 12 }}>
      {/* Top row: channel name + follow placeholder */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, fontFamily: 'FiraCode-Regular' }}>@{video.channelTitle}</Text>
        <TouchableOpacity style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
          <Text style={{ color: colors.text, fontSize: 12 }}>Follow</Text>
        </TouchableOpacity>
      </View>

      {/* YouTube video player (WebView) */}
      {playing ? (
        <WebView
          source={{ uri: embedUrl }}
          style={{ width: width - 24, height: VIDEO_HEIGHT, alignSelf: 'center' }}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          javaScriptEnabled={true}
        />
      ) : (
        <TouchableOpacity onPress={() => setPlaying(true)} style={{ position: 'relative' }}>
          <Image source={{ uri: video.thumbnail }} style={{ width: '100%', height: VIDEO_HEIGHT }} resizeMode="cover" />
          <View style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -25, marginTop: -25 }}>
            <Ionicons name="play-circle" size={50} color="#fff" style={{ opacity: 0.8 }} />
          </View>
        </TouchableOpacity>
      )}

      {/* Video title */}
      <Text style={{ color: colors.text, padding: 12, fontSize: 14, fontWeight: '500' }}>{video.title}</Text>

      {/* Action buttons (same as PostCard) */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity onPress={onLike} style={{ alignItems: 'center' }}>
          <Ionicons name="heart-outline" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRepost} style={{ alignItems: 'center' }}>
          <Ionicons name="repeat-outline" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Repost</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onComment} style={{ alignItems: 'center' }}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Thoughts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={{ alignItems: 'center' }}>
          <Ionicons name="share-outline" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onMenu} style={{ alignItems: 'center' }}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default YouTubeBroadcastCard;
