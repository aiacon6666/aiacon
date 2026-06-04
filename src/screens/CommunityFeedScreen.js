import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getCommunityPosts, postToCommunity } from '../services/backend';
import { colors } from '../theme/colors';
import PostCard from '../components/PostCard';

const CommunityFeedScreen = ({ route }) => {
  const { communityId, communityName } = route.params;
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [sending, setSending] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (refresh = false) => {
    if (!refresh && !hasMore) return;
    setLoading(true);
    const { posts: newPosts, lastVisible } = await getCommunityPosts(communityId, refresh ? null : lastDoc);
    if (refresh) setPosts(newPosts);
    else setPosts(prev => [...prev, ...newPosts]);
    setLastDoc(lastVisible);
    setHasMore(newPosts.length > 0);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!postText.trim()) return;
    setSending(true);
    try {
      await postToCommunity(communityId, user.uid, postText);
      setPostText('');
      loadPosts(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadPosts(true);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color={colors.lavender} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', fontFamily: 'FiraCode-Regular' }}>{communityName}</Text>
        </View>
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={{ ...item, username: item.userId }} onUpdate={() => loadPosts(true)} />}
          keyExtractor={item => item.id}
          onEndReached={() => loadPosts()}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View style={{ padding: 16, backgroundColor: colors.card, margin: 12, borderRadius: 12 }}>
              <TextInput
                style={{ backgroundColor: colors.background, borderRadius: 20, padding: 10, color: colors.text, marginBottom: 8 }}
                placeholder="Share something with the community..."
                placeholderTextColor={colors.textSecondary}
                value={postText}
                onChangeText={setPostText}
                multiline
              />
              <TouchableOpacity onPress={handlePost} disabled={sending} style={{ alignSelf: 'flex-end', backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 }}>
                <Text style={{ color: colors.text }}>{sending ? 'Posting...' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={!loading && <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>No posts yet. Be the first to post!</Text>}
        />
        {loading && <ActivityIndicator size="large" color={colors.lavender} style={{ marginTop: 20 }} />}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default CommunityFeedScreen;
