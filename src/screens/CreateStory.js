import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Image, TextInput, ScrollView, Alert, SafeAreaView, ActivityIndicator, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../services/backend';
import { colors } from '../theme/colors';
import { uploadToTelegram } from '../services/telegramStorage';

const expirationOptions = [12, 18, 24, 30, 36, 42, 48];

const CreateStory = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [media, setMedia] = useState(null);
  const [text, setText] = useState('');
  const [expirationHours, setExpirationHours] = useState(24);
  const [recording, setRecording] = useState(null);
  const [voiceUri, setVoiceUri] = useState(null);
  const [bgMusicUri, setBgMusicUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setMedia(result.assets[0]);
  };

  const takeMedia = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed');
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setMedia(result.assets[0]);
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

  const pickBgMusic = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
    if (result.type === 'success') setBgMusicUri(result.uri);
  };

  const handleSubmit = async () => {
    if (!media && !voiceUri) {
      Alert.alert('Error', 'Add a photo, video, or voice note');
      return;
    }
    setLoading(true);
    try {
      let mediaFileId = null;
      let voiceFileId = null;
      let bgMusicFileId = null;
      let thumbnailUrl = null;

      if (media) {
        const fileName = `story_${user.uid}_${Date.now()}.${media.uri.split('.').pop()}`;
        mediaFileId = await uploadToTelegram(media.uri, fileName);
        thumbnailUrl = media.uri; // temporary; later generate thumbnail
      }
      if (voiceUri) {
        voiceFileId = await uploadToTelegram(voiceUri, `voice_${user.uid}_${Date.now()}.m4a`);
      }
      if (bgMusicUri) {
        bgMusicFileId = await uploadToTelegram(bgMusicUri, `music_${user.uid}_${Date.now()}.m4a`);
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);
      await addDoc(collection(db, 'stories'), {
        userId: user.uid,
        mediaFileId,
        voiceFileId,
        bgMusicFileId,
        type: media ? (media.type || 'image') : 'voice',
        text,
        expiresAt,
        createdAt: new Date(),
        aiVoiceApplied: aiVoiceEnabled,
        thumbnailUrl,
      });
      Alert.alert('Success', 'Story added!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1, padding: 16 }}>
        <ScrollView>
          <Text style={{ fontSize: 24, color: colors.text, fontFamily: 'FiraCode-Regular', marginBottom: 16 }}>Create Story</Text>
          <TouchableOpacity onPress={pickMedia} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 12 }}>
            <Text style={{ color: colors.text }}>Pick from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={takeMedia} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 12 }}>
            <Text style={{ color: colors.text }}>Take Photo/Video</Text>
          </TouchableOpacity>
          {media && <Image source={{ uri: media.uri }} style={{ width: 100, height: 100, borderRadius: 12, marginBottom: 12 }} />}
          <TextInput
            style={{ backgroundColor: colors.card, borderRadius: 12, padding: 12, color: colors.text, marginBottom: 12 }}
            placeholder="Add text..."
            placeholderTextColor={colors.textSecondary}
            value={text}
            onChangeText={setText}
          />
          <Text style={{ color: colors.text, marginBottom: 8 }}>Voice Note:</Text>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <TouchableOpacity onPress={recording ? stopRecording : startRecording} style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 12, marginRight: 8 }}>
              <Text style={{ color: colors.text }}>{recording ? 'Stop Recording' : 'Record Voice'}</Text>
            </TouchableOpacity>
            {voiceUri && <Text style={{ color: colors.lavender }}>✓ Recorded</Text>}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => setAiVoiceEnabled(!aiVoiceEnabled)} style={{ backgroundColor: aiVoiceEnabled ? colors.lavender : colors.card, padding: 8, borderRadius: 8, marginRight: 8 }}>
              <Text style={{ color: colors.text }}>AI Voice Remake</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary }}>(coming soon)</Text>
          </View>
          <TouchableOpacity onPress={pickBgMusic} style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 12 }}>
            <Text style={{ color: colors.text }}>Add Background Music</Text>
          </TouchableOpacity>
          {bgMusicUri && <Text style={{ color: colors.lavender }}>✓ Music added</Text>}
          <Text style={{ color: colors.text, marginBottom: 8 }}>Expires after:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {expirationOptions.map(h => (
              <TouchableOpacity key={h} onPress={() => setExpirationHours(h)} style={{ backgroundColor: expirationHours === h ? colors.primary : colors.card, padding: 8, borderRadius: 20, marginRight: 8 }}>
                <Text style={{ color: colors.text }}>{h} hours</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 30, alignItems: 'center' }}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: colors.text, fontWeight: 'bold' }}>Publish Story</Text>}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};
export default CreateStory;
