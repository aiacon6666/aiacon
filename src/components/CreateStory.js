import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { createStory } from '../services/backend';
import { uploadToTelegram, getTelegramFileUrl } from '../services/telegramStorage';
import { useAuth } from '../context/AuthContext';
import { BACKGROUND_TRACKS } from '../services/music';

function CreateStory({ visible, onClose }) {
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [expiry, setExpiry] = useState(24);
  const [loading, setLoading] = useState(false);

  async function pickMedia() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
    }
  }

  async function handlePost() {
    if (!text && !mediaUri) {
      Alert.alert('Add something', 'Please add text or media to your story.');
      return;
    }
    setLoading(true);
    try {
      let finalMediaUrl = '';
      if (mediaUri) {
        const uploaded = await uploadToTelegram(mediaUri, mediaType);
        finalMediaUrl = await getTelegramFileUrl(uploaded.fileId);
      }
      await createStory(
        user.uid,
        profile.displayName || profile.username || 'User',
        profile.avatar || '',
        finalMediaUrl,
        mediaType,
        text,
        selectedMusic ? selectedMusic.uri : '',
        expiry
      );
      Alert.alert('Story Posted!', 'Your story is live.');
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Story</Text>
          <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.text} size="small" /> : <Text style={styles.postText}>Post</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.mediaPicker} onPress={pickMedia}>
          {mediaUri
            ? <Text style={styles.mediaPickerText}>✅ Media Selected</Text>
            : <><Ionicons name="image-outline" size={40} color={Colors.textSecondary} /><Text style={styles.mediaPickerText}>Tap to add photo/video</Text></>
          }
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Add text to your story..."
          placeholderTextColor={Colors.textSecondary}
          value={text}
          onChangeText={setText}
          multiline
        />

        <Text style={styles.sectionLabel}>Background Music</Text>
        <FlatList
          data={BACKGROUND_TRACKS}
          horizontal
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          renderItem={({ item }) => {
            const isSelected = selectedMusic && selectedMusic.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.musicChip, isSelected && styles.musicChipSelected]}
                onPress={() => setSelectedMusic(isSelected ? null : item)}
              >
                <Ionicons name="musical-notes" size={14} color={isSelected ? Colors.text : Colors.textSecondary} />
                <Text style={[styles.musicChipText, isSelected && { color: Colors.text }]}>{item.title}</Text>
              </TouchableOpacity>
            );
          }}
        />

        <Text style={styles.sectionLabel}>Expires In</Text>
        <View style={styles.expiryRow}>
          {[12, 24, 48].map(h => (
            <TouchableOpacity
              key={h}
              style={[styles.expiryBtn, expiry === h && styles.expiryBtnSelected]}
              onPress={() => setExpiry(h)}
            >
              <Text style={[styles.expiryText, expiry === h && { color: Colors.text }]}>{h}h</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  postBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  postText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  mediaPicker: {
    margin: 16,
    height: 180,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  mediaPickerText: {
    color: Colors.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },
  textInput: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  musicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  musicChipSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.accent,
  },
  musicChipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 5,
  },
  expiryRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
  },
  expiryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 10,
    backgroundColor: Colors.card,
  },
  expiryBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  expiryText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});

export default CreateStory;
