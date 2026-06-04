import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/backend';
import { colors } from '../theme/colors';

const AboutStories = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'stories'),
      where('expiresAt', '>', new Date()),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const openStoryViewer = (storyId) => navigation.navigate('StoryViewer', { storyId });
  const createNewStory = () => navigation.navigate('CreateStory');

  if (loading) return <ActivityIndicator size="small" color={colors.lavender} />;
  return (
    <View style={{ paddingVertical: 12, backgroundColor: colors.background }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ id: 'add' }, ...stories]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if (item.id === 'add') {
            return (
              <TouchableOpacity onPress={createNewStory} style={{ marginHorizontal: 8, alignItems: 'center' }}>
                <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.lavender }}>
                  <Text style={{ fontSize: 30, color: colors.lavender }}>+</Text>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Your Story</Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity onPress={() => openStoryViewer(item.id)} style={{ marginHorizontal: 8, alignItems: 'center' }}>
              <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/70' }} style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: colors.lavender }} />
              <Text style={{ color: colors.text, fontSize: 12, marginTop: 4 }} numberOfLines={1}>{item.userName || 'User'}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};
export default AboutStories;
