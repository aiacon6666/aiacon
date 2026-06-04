import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Video } from 'expo-av';
import { Audio } from 'expo-av';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/backend';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { getTelegramFileUrl } from '../services/telegramStorage';

const StoryViewer = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { storyId } = route.params;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [bgMusicUrl, setBgMusicUrl] = useState(null);
  const [sound, setSound] = useState();

  useEffect(() => {
    const fetchStory = async () => {
      const docSnap = await getDoc(doc(db, 'stories', storyId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStory(data);
        if (data.mediaFileId) setMediaUrl(await getTelegramFileUrl(data.mediaFileId));
        if (data.voiceFileId) setVoiceUrl(await getTelegramFileUrl(data.voiceFileId));
        if (data.bgMusicFileId) setBgMusicUrl(await getTelegramFileUrl(data.bgMusicFileId));
      }
      setLoading(false);
    };
    fetchStory();
    return () => { if (sound) sound.unloadAsync(); };
  }, []);

  const playBgMusic = async () => {
    if (bgMusicUrl && !sound) {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: bgMusicUrl });
      setSound(newSound);
      await newSound.playAsync();
    }
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><ActivityIndicator size="large" color={colors.lavender} /></View>;
  if (!story) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}><Text style={{ color: colors.text }}>Story not found</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', top: 40, left: 20, zIndex: 10 }}>
        <Ionicons name="arrow-back" size={28} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={playBgMusic} style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
        <Ionicons name="musical-notes" size={28} color={colors.lavender} />
      </TouchableOpacity>
      {story.type === 'image' && mediaUrl && <Image source={{ uri: mediaUrl }} style={{ flex: 1 }} resizeMode="contain" />}
      {story.type === 'video' && mediaUrl && <Video source={{ uri: mediaUrl }} style={{ flex: 1 }} resizeMode="contain" shouldPlay useNativeControls />}
      {story.type === 'voice' && voiceUrl && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="mic" size={80} color={colors.lavender} />
          <Video source={{ uri: voiceUrl }} style={{ width: 0, height: 0 }} shouldPlay />
        </View>
      )}
      {story.text && <Text style={{ position: 'absolute', bottom: 80, left: 20, right: 20, color: colors.text, fontSize: 18, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, borderRadius: 12 }}>{story.text}</Text>}
    </View>
  );
};
export default StoryViewer;
