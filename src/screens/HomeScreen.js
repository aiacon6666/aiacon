import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { getFeed, likeBroadcast, unlikeBroadcast, getCurrentUser } from '../services/backend';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

function AboutBar() {
  return (
    <View style={styles.aboutBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[1,2,3,4,5].map(i => (
          <TouchableOpacity key={i} style={styles.aboutRing}>
            <View style={styles.aboutInner}>
              <Text style={styles.aboutPlus}>+</Text>
            </View>
            <Text style={styles.aboutLabel}>You</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser && post.likes?.includes(currentUser.uid)) setLiked(true);
  }, []);

  const toggleLike = async () => {
    if (!currentUser) return;
    if (liked) {
      await unlikeBroadcast(post.id, currentUser.uid);
      setLiked(false);
    } else {
      await likeBroadcast(post.id, currentUser.uid);
      setLiked(true);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.userPhoto || 'https://via.placeholder.com/40' }} style={styles.avatar} />
        <Text style={styles.username}>{post.username || 'user'}</Text>
      </View>
      {post.mediaUrls?.[0] ? (
        <Image source={{ uri: post.mediaUrls[0] }} style={styles.postImage} resizeMode="cover" />
      ) : null}
      <Text style={styles.postText}>{post.text}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={toggleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#FF2D55' : '#FFF'} />
        </TouchableOpacity>
        <TouchableOpacity><Ionicons name="chatbubble-outline" size={22} color="#FFF" /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="share-outline" size={22} color="#FFF" /></TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const feed = await getFeed();
    setPosts(feed);
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      ListHeaderComponent={<AboutBar />}
      renderItem={({ item }) => <PostCard post={item} />}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#121212', paddingBottom: 20 },
  aboutBar: { paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#333' },
  aboutRing: { alignItems: 'center', marginHorizontal: 12 },
  aboutInner: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: '#0047AB', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A2E' },
  aboutPlus: { color: '#00FFFF', fontSize: 30 },
  aboutLabel: { color: '#FFF', fontSize: 12, marginTop: 4 },
  card: { backgroundColor: '#1A1A2E', borderRadius: 16, marginBottom: 16, padding: 12, marginHorizontal: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  postImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 10 },
  postText: { color: '#FFF', fontSize: 15, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 20, paddingTop: 8, borderTopWidth: 0.5, borderColor: '#333' },
});
