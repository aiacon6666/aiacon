import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Dimensions, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { uploadProfilePicture, updateUserProfile } from '../services/backend';

const AVATAR_STYLES = [
  { id: 'real', label: 'Real', emoji: '👤', bg: '#0047AB' },
  { id: 'block', label: 'Block', emoji: '🧱', bg: '#3F0D6C' },
  { id: 'anime', label: 'Anime', emoji: '🌸', bg: '#880E4F' },
  { id: 'ai', label: 'AI', emoji: '🤖', bg: '#1A237E' },
  { id: 'futuristic', label: 'Futuristic', emoji: '🚀', bg: '#004D40' },
  { id: 'self', label: 'Self', emoji: '📸', bg: '#BF360C' },
];

function AvatarCreator({ onComplete }) {
  const { user, profile, saveProfile } = useAuth();
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selfieUri, setSelfieUri] = useState(null);
  const [saving, setSaving] = useState(false);

  async function pickSelfie() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelfieUri(result.assets[0].uri);
    }
  }

  async function takeSelfie() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelfieUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!selectedStyle) {
      Alert.alert('Error', 'Please select an avatar style');
      return;
    }
    setSaving(true);
    try {
      let avatarUrl = '';
      if (selectedStyle === 'self' && selfieUri) {
        avatarUrl = await uploadProfilePicture(user.uid, selfieUri);
      } else {
        // Use a placeholder avatar based on style
        avatarUrl = `https://ui-avatars.com/api/?name=${selectedStyle}&background=${AVATAR_STYLES.find(s => s.id === selectedStyle)?.bg.slice(1)}&color=fff&size=200`;
      }
      await saveProfile(user.uid, { avatar: avatarUrl, avatarStyle: selectedStyle });
      Alert.alert('Success', 'Avatar created!');
      if (onComplete) onComplete();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Avatar Style</Text>
      <FlatList
        data={AVATAR_STYLES}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const isSelected = selectedStyle === item.id;
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected, { borderColor: item.bg }]}
              onPress={() => setSelectedStyle(item.id)}
            >
              <View style={[styles.iconBg, { backgroundColor: item.bg }]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />
      {selectedStyle === 'self' && (
        <View style={styles.selfieRow}>
          <TouchableOpacity style={styles.selfieBtn} onPress={pickSelfie}>
            <Ionicons name="images-outline" size={22} color={Colors.text} />
            <Text style={styles.selfieText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selfieBtn} onPress={takeSelfie}>
            <Ionicons name="camera-outline" size={22} color={Colors.text} />
            <Text style={styles.selfieText}>Camera</Text>
          </TouchableOpacity>
        </View>
      )}
      {selfieUri && <Image source={{ uri: selfieUri }} style={styles.preview} />}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Avatar'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    alignItems: 'center',
  },
  card: {
    width: (Dimensions.get('window').width - 60) / 2,
    margin: 8,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  cardSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.secondary,
  },
  iconBg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emoji: {
    fontSize: 36,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  labelSelected: {
    color: Colors.text,
  },
  selfieRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  selfieBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selfieText: {
    color: Colors.text,
    marginLeft: 8,
    fontSize: 14,
  },
  preview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
  },
  saveText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AvatarCreator;
