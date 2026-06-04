import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { updateDoc, doc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../services/backend';
import { colors } from '../theme/colors';
import { uploadToTelegram } from '../services/telegramStorage';

const CommentItem = ({ comment, postId, onUpdate }) => {
  const { user, userData } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isLiked, setIsLiked] = useState(comment.likes?.includes(user?.uid) || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);

  const handleLikeComment = async () => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    const updatedComments = [...(comment.replies || [])];
    // Find the comment in the array and update its like status
    // For simplicity, we'll update the whole comment object in Firestore
    // But to avoid complexity, we'll call a Cloud Function or restructure.
    // For MVP, we'll store likes in a subcollection? Overkill. Let's do simple: update comment's likes array.
    // Since comments are stored as array of objects, we need to update the entire array. We'll use a helper.
    try {
      const currentPost = (await getDoc(postRef)).data();
      const updatedCommentsList = currentPost.comments.map(c => {
        if (c.id === comment.id) {
          const likes = c.likes || [];
          if (isLiked) {
            return { ...c, likes: likes.filter(uid => uid !== user.uid), likeCount: (c.likeCount || 1) - 1 };
          } else {
            return { ...c, likes: [...likes, user.uid], likeCount: (c.likeCount || 0) + 1 };
          }
        }
        return c;
      });
      await updateDoc(postRef, { comments: updatedCommentsList });
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const replyData = {
        id: Date.now().toString(),
        userId: user.uid,
        username: userData?.username || 'user',
        text: replyText,
        createdAt: new Date(),
        likes: [],
        likeCount: 0,
        replies: [],
      };
      const postRef = doc(db, 'posts', postId);
      const currentPost = (await getDoc(postRef)).data();
      const updatedComments = currentPost.comments.map(c => {
        if (c.id === comment.id) {
          return { ...c, replies: [...(c.replies || []), replyData] };
        }
        return c;
      });
      await updateDoc(postRef, { comments: updatedComments });
      setReplyText('');
      setShowReplyInput(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <View style={{ marginBottom: 12, marginLeft: comment.parentId ? 40 : 0 }}>
      <View style={{ backgroundColor: colors.card, padding: 8, borderRadius: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.lavender, fontWeight: 'bold' }}>@{comment.username}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={handleLikeComment} style={{ marginRight: 12 }}>
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={16} color={isLiked ? colors.error : colors.lavender} />
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{likeCount}</Text>
            <TouchableOpacity onPress={() => setShowReplyInput(!showReplyInput)} style={{ marginLeft: 12 }}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.lavender} />
            </TouchableOpacity>
          </View>
        </View>
        {comment.text && <Text style={{ color: colors.text, marginTop: 4 }}>{comment.text}</Text>}
        {comment.mediaUrl && <Image source={{ uri: comment.mediaUrl }} style={{ width: 100, height: 100, marginTop: 4 }} />}
        {comment.voiceUrl && (
          <TouchableOpacity onPress={() => {}} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Ionicons name="mic" size={20} color={colors.lavender} />
            <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>Voice message</Text>
          </TouchableOpacity>
        )}
        {showReplyInput && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <TextInput
              style={{ flex: 1, backgroundColor: colors.background, borderRadius: 20, padding: 8, color: colors.text }}
              placeholder="Write a reply..."
              placeholderTextColor={colors.textSecondary}
              value={replyText}
              onChangeText={setReplyText}
            />
            <TouchableOpacity onPress={submitReply} disabled={sendingReply} style={{ marginLeft: 8 }}>
              {sendingReply ? <ActivityIndicator size="small" color={colors.lavender} /> : <Ionicons name="send" size={20} color={colors.lavender} />}
            </TouchableOpacity>
          </View>
        )}
        {comment.replies && comment.replies.map(reply => (
          <CommentItem key={reply.id} comment={reply} postId={postId} onUpdate={onUpdate} />
        ))}
      </View>
    </View>
  );
};

export default CommentItem;
