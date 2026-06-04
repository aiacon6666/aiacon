import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Image,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { fetchActiveStories } from '../services/backend';
import { useAuth } from '../context/AuthContext';

const STORY_SIZE = 70;

function AboutStories({ onCreateStory, onViewStory }) {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState([]);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    try {
      const s = await fetchActiveStories();
      setStories(s);
    } catch (e) {
      console.log('fetchActiveStories error', e);
    }
  }

  // Group stories by authorId
  const grouped = {};
  stories.forEach(s => {
    if (!grouped[s.authorId]) grouped[s.authorId] = [];
    grouped[s.authorId].push(s);
  });
  const authors = Object.keys(grouped);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Create Story */}
        <TouchableOpacity style={styles.storyItem} onPress={onCreateStory}>
          <View style={styles.createCircle}>
            <FastImage
              source={{ uri: profile && profile.avatar ? profile.avatar : `https://ui-avatars.com/api/?name=Me&background=0047AB&color=fff` }}
              style={styles.avatar}
            />
            <View style={styles.plusBadge}>
              <Ionicons name="add" size={14} color={Colors.text} />
            </View>
          </View>
          <Text style={styles.label} numberOfLines={1}>Your Story</Text>
        </TouchableOpacity>

        {/* Other Users' Stories */}
        {authors.map(authorId => {
          const userStories = grouped[authorId];
          const first = userStories[0];
          const unseen = user ? userStories.some(s => !s.viewers || s.viewers.indexOf(user.uid) === -1) : true;
          return (
            <TouchableOpacity
              key={authorId}
              style={styles.storyItem}
              onPress={() => onViewStory(userStories)}
            >
              <View style={[styles.storyRing, unseen ? styles.unseenRing : styles.seenRing]}>
                <FastImage
                  source={{ uri: first.authorAvatar || `https://ui-avatars.com/api/?name=${first.authorName || 'U'}&background=3F0D6C&color=fff` }}
                  style={styles.avatar}
                />
              </View>
              <Text style={styles.label} numberOfLines={1}>{first.authorName || 'User'}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 10,
  },
  scroll: {
    paddingHorizontal: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 14,
    width: STORY_SIZE,
  },
  createCircle: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.border,
    overflow: 'visible',
    position: 'relative',
  },
  avatar: {
    width: STORY_SIZE,
    height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  storyRing: {
    width: STORY_SIZE + 4,
    height: STORY_SIZE + 4,
    borderRadius: (STORY_SIZE + 4) / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unseenRing: {
    borderColor: Colors.accent,
  },
  seenRing: {
    borderColor: Colors.border,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default AboutStories;
