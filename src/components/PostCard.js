import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { updateDoc, doc, increment, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db, followUser, unfollowUser, getFollowingList } from '../services/backend';
import { colors } from '../theme/colors';
import { uploadToTelegram } from '../services/telegramStorage';
import CommentItem from './CommentItem';

const PostCard = ({ post, onUpdate }) => {
  const { user, userData } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentMedia, setCommentMedia] = useState(null);
  const [sendingComment, setSendingComment] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [recording, setRecording] = useState(null);
  const [voiceUri, setVoiceUri] = useState(null);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?.uid) || false);
  const [isReposted, setIsReposted] = useState(post.reposts?.includes(user?.uid) || false);
  const [isSaved, setIsSaved] = useState(post.savedBy?.includes(user?.uid) || false);

  useEffect(() => {
    const checkFollow = async () => {
      if (!user) return;
      const following = await getFollowingList();
      setIsFollowing(following.includes(post.userId));
    };
    checkFollow();
  }, [post.userId, user]);

  const handleFollow = async () => {
    if (!user) return;
    if (isFollowing) {
      await unfollowUser(post.userId);
      setIsFollowing(false);
    } else {
      await followUser(post.userId);
      setIsFollowing(true);
    }
    if (onUpdate) onUpdate();
  };

  const handleLike = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    if (isLiked) {
      await updateDoc(postRef, { likes: arrayRemove(user.uid), likeCount: increment(-1) });
      setIsLiked(false);
    } else {
      await updateDoc(postRef, { likes: arrayUnion(user.uid), likeCount: increment(1) });
      if (post.userId !== user.uid) {
        await updateDoc(doc(db, 'users', post.userId), { aura: increment(1) });
      }
      setIsLiked(true);
    }
    if (onUpdate) onUpdate();
  };

  const handleRepost = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    if (isReposted) {
      await updateDoc(postRef, { reposts: arrayRemove(user.uid), repostCount: increment(-1) });
      setIsReposted(false);
    } else {
      await updateDoc(postRef, { reposts: arrayUnion(user.uid), repostCount: increment(1) });
      if (post.userId !== user.uid) {
        await updateDoc(doc(db, 'users', post.userId), { aura: increment(1) });
      }
      setIsReposted(true);
    }
    if (onUpdate) onUpdate();
  };

  const handleSendLove = async () => {
    if (!user) return;
    const userAura = userData?.aura || 0;
if (userAura - 90 < -99) { Alert.alert("Cannot go below -99 Aura"); return; }
    if (userAura < 90) {
      Alert.alert('Insufficient Aura', `You need 90 Aura to send love. Your balance: ${userAura}`);
      return;
    }
    await updateDoc(doc(db, 'users', user.uid), { aura: increment(-90) });
    await updateDoc(doc(db, 'users', post.userId), { aura: increment(9) });
    Alert.alert('Love Sent', `You sent +9 Aura to ${post.username || 'creator'}`);
    if (onUpdate) onUpdate();
  };

  const handleSave = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', post.id);
    if (isSaved) {
      await updateDoc(postRef, { savedBy: arrayRemove(user.uid) });
      setIsSaved(false);
    } else {
      await updateDoc(postRef, { savedBy: arrayUnion(user.uid) });
      setIsSaved(true);
    }
    if (onUpdate) onUpdate();
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) return Alert.alert('Microphone permission required');
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (err) { console.error(err); }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setVoiceUri(uri);
    setRecording(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setCommentMedia(result.assets[0].uri);
  };

  const handleGif = () => {
    Alert.alert('GIFs', 'GIPHY integration coming soon. For now, select an image.');
  };

  const handleSticker = () => {
    Alert.alert('Stickers', 'Sticker pack integration coming soon.');
  };

  const submitComment = async () => {
    if (!commentText.trim() && !commentMedia && !voiceUri) return;
    setSendingComment(true);
    try {
      let mediaUrl = null;
      if (commentMedia) {
        mediaUrl = await uploadToTelegram(commentMedia, `comment_img_${Date.now()}.jpg`);
      }
      let voiceUrl = null;
      if (voiceUri) {
        voiceUrl = await uploadToTelegram(voiceUri, `comment_voice_${Date.now()}.m4a`);
      }
      const commentData = {
        id: Date.now().toString(),
        userId: user.uid,
        username: userData?.username || 'user',
        text: commentText,
        mediaUrl,
        voiceUrl,
        createdAt: new Date(),
        likes: [],
        likeCount: 0,
        replies: [],
      };
      const postRef = doc(db, 'posts', post.id);
      const currentPost = await getDoc(postRef);
      const existingComments = currentPost.data()?.comments || [];
      await updateDoc(postRef, {
        comments: [...existingComments, commentData],
        commentCount: increment(1),
      });
      setCommentText('');
      setCommentMedia(null);
      setVoiceUri(null);
      setShowCommentModal(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSendingComment(false);
    }
  };

  const openCommentModal = () => setShowCommentModal(true);

  const menuItems = [
    { icon: isSaved ? 'bookmark' : 'bookmark-outline', label: isSaved ? 'Unlocker' : 'Locker (Save)', action: handleSave },
    { icon: 'eye-off-outline', label: 'Hide like from followers', action: () => Alert.alert('Hide Like', 'Feature coming soon') },
    { icon: 'thumbs-up-outline', label: 'Interested', action: () => Alert.alert('Interested', 'We will show more like this') },
    { icon: 'thumbs-down-outline', label: 'Not Interested', action: () => Alert.alert('Not Interested', 'We will show less like this') },
    { icon: 'language-outline', label: 'Translate', action: () => Alert.alert('Translate', 'Coming soon') },
    { icon: 'gift-outline', label: 'Send Love (+9 Aura)', action: handleSendLove },
    { icon: 'flag-outline', label: 'Report', action: () => Alert.alert('Report', 'Thank you for keeping our community safe') },
  ];

  return (
    <View style={{ backgroundColor: colors.card, marginBottom: 12, borderRadius: 12, overflow: 'hidden', marginHorizontal: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 }}>
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 16, fontFamily: 'FiraCode-Regular' }}>@{post.username || 'user'}</Text>
        {post.userId !== user?.uid && (
          <TouchableOpacity onPress={handleFollow} style={{ backgroundColor: isFollowing ? colors.card : colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: isFollowing ? 1 : 0, borderColor: colors.lavender }}>
            <Text style={{ color: isFollowing ? colors.lavender : colors.text, fontSize: 12 }}>{isFollowing ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {post.mediaUrl && <Image source={{ uri: post.mediaUrl }} style={{ width: '100%', height: 300 }} resizeMode="cover" />}
      {post.text && <Text style={{ color: colors.text, padding: 12 }}>{post.text}</Text>}
      <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 6 }}>
        <Text style={{ color: colors.textSecondary, marginRight: 12 }}>{post.likeCount || 0} likes</Text>
        <Text style={{ color: colors.textSecondary, marginRight: 12 }}>{post.commentCount || 0} comments</Text>
        <Text style={{ color: colors.textSecondary, marginRight: 12 }}>{post.repostCount || 0} reposts</Text>
        <Text style={{ color: colors.textSecondary }}>{post.shareCount || 0} shares</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity onPress={handleLike} style={{ alignItems: 'center' }}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={24} color={isLiked ? colors.error : colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRepost} style={{ alignItems: 'center' }}>
          <Ionicons name="repeat-outline" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Repost</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openCommentModal} style={{ alignItems: 'center' }}>
          <Ionicons name="chatbubble-outline" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Thoughts</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert('Share', 'Share options coming soon')} style={{ alignItems: 'center' }}>
          <Ionicons name="share-outline" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowMenu(true)} style={{ alignItems: 'center' }}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.lavender} />
          <Text style={{ color: colors.textSecondary, fontSize: 10 }}>More</Text>
        </TouchableOpacity>
      </View>
      {/* Three-dot menu modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, width: '80%' }}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity key={idx} onPress={item.action} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
                <Ionicons name={item.icon} size={24} color={colors.lavender} />
                <Text style={{ color: colors.text, marginLeft: 12 }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowMenu(false)} style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: colors.lavender }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Comment modal with rich inputs */}
      <Modal visible={showCommentModal} animationType="slide" onRequestClose={() => setShowCommentModal(false)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Thoughts ({post.comments?.length || 0})</Text>
            <TouchableOpacity onPress={() => setShowCommentModal(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {post.comments?.map(comment => (
              <CommentItem key={comment.id} comment={comment} postId={post.id} onUpdate={onUpdate} />
            ))}
          </ScrollView>
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity onPress={pickImage} style={{ marginRight: 12 }}>
                <Ionicons name="image-outline" size={28} color={colors.lavender} />
              </TouchableOpacity>
              <TouchableOpacity onPress={recording ? stopRecording : startRecording} style={{ marginRight: 12 }}>
                <Ionicons name={recording ? 'mic' : 'mic-outline'} size={28} color={recording ? colors.error : colors.lavender} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleGif} style={{ marginRight: 12 }}>
                <Ionicons name="gift-outline" size={28} color={colors.lavender} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSticker}>
                <Ionicons name="happy-outline" size={28} color={colors.lavender} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 10, color: colors.text }}
                placeholder="Write a thought..."
                placeholderTextColor={colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity onPress={submitComment} disabled={sendingComment} style={{ marginLeft: 8 }}>
                {sendingComment ? <ActivityIndicator size="small" color={colors.lavender} /> : <Ionicons name="send" size={24} color={colors.lavender} />}
              </TouchableOpacity>
            </View>
            {(commentMedia || voiceUri) && (
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {commentMedia && <Text style={{ color: colors.textSecondary }}>📷 Image attached</Text>}
                {voiceUri && <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>🎤 Voice note ready</Text>}
                <TouchableOpacity onPress={() => { setCommentMedia(null); setVoiceUri(null); }}>
                  <Text style={{ color: colors.error, marginLeft: 8 }}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostCard;
