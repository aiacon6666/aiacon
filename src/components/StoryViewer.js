import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Dimensions, Image, Animated,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

const SCREEN_W = Dimensions.get('window').width;
const STORY_DURATION = 5000;

function StoryViewer({ visible, stories, onClose }) {
  const [index, setIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  let timerRef = useRef(null);

  useEffect(() => {
    if (visible && stories.length > 0) {
      setIndex(0);
      startProgress();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      progressAnim.stopAnimation();
    };
  }, [visible]);

  useEffect(() => {
    if (visible) {
      progressAnim.setValue(0);
      startProgress();
    }
  }, [index]);

  function startProgress() {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) nextStory();
    });
  }

  function nextStory() {
    if (index < stories.length - 1) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  }

  function prevStory() {
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  if (!stories.length) return null;
  const current = stories[index];

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Progress bars */}
        <View style={styles.progressRow}>
          {stories.map((s, i) => (
            <View key={i} style={styles.progressBarBg}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  i < index && styles.progressFull,
                  i === index && {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Author header */}
        <View style={styles.authorRow}>
          <FastImage
            source={{ uri: current.authorAvatar || `https://ui-avatars.com/api/?name=U&background=3F0D6C&color=fff` }}
            style={styles.authorAvatar}
          />
          <Text style={styles.authorName}>{current.authorName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={26} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Media */}
        {current.mediaUrl ? (
          <FastImage
            source={{ uri: current.mediaUrl }}
            style={styles.media}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={[styles.media, { backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: Colors.text, fontSize: 22, padding: 30, textAlign: 'center' }}>
              {current.text}
            </Text>
          </View>
        )}

        {/* Text overlay */}
        {current.text && current.mediaUrl ? (
          <View style={styles.textOverlay}>
            <Text style={styles.overlayText}>{current.text}</Text>
          </View>
        ) : null}

        {/* Tap zones */}
        <View style={styles.tapZones}>
          <TouchableOpacity style={styles.tapLeft} onPress={prevStory} />
          <TouchableOpacity style={styles.tapRight} onPress={nextStory} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.text,
    borderRadius: 2,
  },
  progressFull: {
    width: '100%',
  },
  authorRow: {
    position: 'absolute',
    top: 62,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.text,
  },
  authorName: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  media: {
    flex: 1,
    width: '100%',
  },
  textOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    padding: 12,
  },
  overlayText: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
  },
  tapZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 1,
  },
});

export default StoryViewer;
