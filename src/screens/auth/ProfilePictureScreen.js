import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  FlatList, ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { serverTimestamp } from 'firebase/firestore';

const DEFAULT_AVATARS = [
  'https://ui-avatars.com/api/?name=A&background=0047AB&color=fff&size=128',
  'https://ui-avatars.com/api/?name=B&background=3F0D6C&color=fff&size=128',
  'https://ui-avatars.com/api/?name=C&background=880E4F&color=fff&size=128',
  'https://ui-avatars.com/api/?name=D&background=004D40&color=fff&size=128',
  'https://ui-avatars.com/api/?name=E&background=BF360C&color=fff&size=128',
  'https://ui-avatars.com/api/?name=F&background=1A237E&color=fff&size=128',
];

function ProfilePictureScreen({ navigation, route }) {
  const params = route.params || {};
  const { saveProfile } = useAuth();
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [saving, setSaving] = useState(false);

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await saveProfile(params.uid, {
        uid: params.uid,
        email: params.email || '',
        username: params.username || '',
        displayName: params.displayName || '',
        dob: params.dob || '',
        gender: params.gender || '',
        bio: params.bio || '',
        link: params.link || '',
        avatar: avatar,
        aura: 0,
        followers: [],
        following: [],
        isGuest: false,
        createdAt: serverTimestamp(),
      });
      // After saving profile, navigate to main app (Home)
      navigation.replace('Main');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.step}>Step 6 of 6</Text>
      <Text style={styles.title}>Profile Picture</Text>
      <Text style={styles.subtitle}>Pick one or upload your own.</Text>

      <View style={styles.previewWrap}>
        <Image source={{ uri: avatar }} style={styles.preview} />
      </View>

      <FlatList
        data={DEFAULT_AVATARS}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 16 }}
        renderItem={({ item }) => {
          const isSelected = avatar === item;
          return (
            <TouchableOpacity onPress={() => setAvatar(item)}>
              <Image source={{ uri: item }} style={[styles.thumb, isSelected && styles.thumbSelected]} />
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
        <Ionicons name="image-outline" size={18} color={Colors.accent} />
        <Text style={styles.galleryText}>Upload from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={handleFinish} disabled={saving}>
        {saving ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.btnText}>🎉 Finish Setup</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 70 },
  back: { position: 'absolute', top: 50, left: 20 },
  step: { color: Colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 12, marginTop: 20, fontFamily: 'FiraCode-Regular' },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700', marginBottom: 6, fontFamily: 'FiraCode-Regular' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 24, fontFamily: 'FiraCode-Regular' },
  previewWrap: { alignItems: 'center', marginBottom: 20 },
  preview: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.accent },
  thumb: { width: 56, height: 56, borderRadius: 28, marginRight: 10, borderWidth: 2, borderColor: Colors.border },
  thumbSelected: { borderColor: Colors.accent },
  galleryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.card,
  },
  galleryText: { color: Colors.accent, marginLeft: 8, fontSize: 14, fontWeight: '600', fontFamily: 'FiraCode-Regular' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default ProfilePictureScreen;
