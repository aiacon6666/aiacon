import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Modal, Dimensions, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import Colors from '../theme/colors';
import { toggleLike, repostPost, giftAura, followUser, unfollowUser } from '../services/backend';
import { useAuth } from '../context/AuthContext';

const SCREEN_W = Dimensions.get('window').width;

function PostCard({ post, onThoughts }) {
  const { user, profile } = useAuth();
  const [liked, setLiked] = useState(post.likes && user ? post.likes.includes(user.uid) : false);
  const [likeCount, setLikeCount] = useState(post.likes ? post.likes.length : 0);
  const [reposted, setReposted] = useState(post.reposts && user ? post.reposts.includes(user.uid) : false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [following, setFollowing] = useState(profile && profile.following ? profile.following.includes(post.authorId) : false);

  function handleLike() {
    if (!user) return;
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    toggleLike(post.id, user.uid);
  }

  function handleRepost() {
    if (!user || reposted) return;
    setReposted(true);
    repostPost(post.id, user.uid);
  }

  function handleFollow() {
    if (!user) return;
    if (following) {
      unfollowUser(user.uid, post.authorId);
    } else {
      followUser(user.uid, post.authorId);
    }
    setFollowing(!following);
  }

  function handleGiftAura() {
    if (!user) return;
    Alert.alert('Send Aura', `Gift 9 Aura to ${post.authorName}? (Costs 90 Aura)`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Gift 💜',
        onPress: () => {
          giftAura(user.uid, post.authorId);
          Alert.alert('Aura Sent!', `You gifted Aura to ${post.authorName}`);
        },
      },
    ]);
  }

  const menuOptions = [
    { label: '🔒 Locker', action: () => { Alert.alert('Saved to Locker'); setMenuVisible(false); } },
    { label: '💗 Hide like count', action: () => setMenuVisible(false) },
    { label: '✅ Interested', action: () => setMenuVisible(false) },
    { label: '❌ Not interested', action: () => setMenuVisible(false) },
    { label: '🌐 Translate', action: () => setMenuVisible(false) },
    { label: '🚩 Report', action: () => { Alert.alert('Reported'); setMenuVisible(false); } },
    { label: '💜 Send Aura', action: () => { setMenuVisible(false); handleGiftAura(); } },
  ];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <FastImage
          source={{ uri: post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}&background=0047AB&color=fff` }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{post.authorName || 'User'}</Text>
          <Text style={styles.timestamp}>just now</Text>
        </View>
        {user && user.uid !== post.authorId && (
          <TouchableOpacity style={[styles.followBtn, following && styles.followingBtn]} onPress={handleFollow}>
            <Text style={styles.followText}>{following ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}

      {/* Media */}
      {post.mediaUrl && post.mediaType === 'image' && (
        <FastImage source={{ uri: post.mediaUrl }} style={styles.media} resizeMode={FastImage.resizeMode.cover} />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={handleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#FF4466' : Colors.textSecondary} />
          <Text style={styles.actionCount}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={() => { if (onThoughts) onThoughts(post); }}>
          <Ionicons name="chatbubble-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.actionCount}>{post.thoughts || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action} onPress={handleRepost}>
          <MaterialCommunityIcons name="repeat" size={22} color={reposted ? Colors.accent : Colors.textSecondary} />
          <Text style={styles.actionCount}>{post.reposts ? post.reposts.length : 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Feather name="share-2" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionCount}>{post.shares || 0}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuCard}>
            {menuOptions.map((opt, i) => (
              <TouchableOpacity key={i} style={styles.menuItem} onPress={opt.action}>
                <Text style={styles.menuText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  timestamp: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  followBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginRight: 8,
  },
  followingBtn: {
    backgroundColor: Colors.primary,
  },
  followText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  moreBtn: {
    padding: 4,
  },
  caption: {
    color: Colors.text,
    fontSize: 14,
    paddingHorizontal: 12,
    paddingBottom: 10,
    lineHeight: 20,
  },
  media: {
    width: '100%',
    height: SCREEN_W * 0.6,
    backgroundColor: Colors.border,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionCount: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    width: 240,
    padding: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  menuText: {
    color: Colors.text,
    fontSize: 15,
  },
});

export default PostCard;
