import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useAuth } from '../context/AuthContext';
import { sendMessage, subscribeToMessages, markMessagesAsRead } from '../services/backend';
import { uploadToTelegram } from '../services/telegramStorage';
import { colors } from '../theme/colors';

const ChatScreen = ({ route, navigation }) => {
  const { conversationId, otherUser } = route.params;
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(null);
  const [voiceUri, setVoiceUri] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (msgs) => {
      setMessages(msgs);
      flatListRef.current?.scrollToEnd({ animated: true });
    });
    markMessagesAsRead(conversationId, user.uid);
    navigation.setOptions({ title: `@${otherUser?.username || 'User'}` });
    return () => unsubscribe();
  }, [conversationId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      await sendMedia(result.assets[0].uri, 'image');
    }
  };

  const sendMedia = async (uri, type) => {
    setSending(true);
    try {
      const fileId = await uploadToTelegram(uri, `chat_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`);
      await sendMessage(conversationId, user.uid, '', fileId, null);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
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
    // Send voice message automatically
    await sendVoice(uri);
  };

  const sendVoice = async (uri) => {
    setSending(true);
    try {
      const fileId = await uploadToTelegram(uri, `voice_${Date.now()}.m4a`);
      await sendMessage(conversationId, user.uid, '', null, fileId);
      setVoiceUri(null);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  const sendText = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    try {
      await sendMessage(conversationId, user.uid, messageText);
      setMessageText('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={{ alignSelf: item.senderId === user.uid ? 'flex-end' : 'flex-start', marginVertical: 4, marginHorizontal: 8, maxWidth: '80%' }}>
      <View style={{ backgroundColor: item.senderId === user.uid ? colors.primary : colors.card, padding: 10, borderRadius: 12 }}>
        {item.text ? <Text style={{ color: colors.text }}>{item.text}</Text> : null}
        {item.mediaUrl && <Image source={{ uri: item.mediaUrl }} style={{ width: 150, height: 150, borderRadius: 8, marginTop: 4 }} />}
        {item.voiceUrl && (
          <TouchableOpacity onPress={() => {}} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="mic" size={20} color={colors.lavender} />
            <Text style={{ color: colors.textSecondary, marginLeft: 8 }}>Voice message</Text>
          </TouchableOpacity>
        )}
        <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>{new Date(item.createdAt?.toDate()).toLocaleTimeString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
          <View style={{ flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' }}>
            <TouchableOpacity onPress={pickImage} style={{ marginRight: 8 }}>
              <Ionicons name="image-outline" size={28} color={colors.lavender} />
            </TouchableOpacity>
            <TouchableOpacity onPress={recording ? stopRecording : startRecording} style={{ marginRight: 8 }}>
              <Ionicons name={recording ? 'mic' : 'mic-outline'} size={28} color={recording ? colors.error : colors.lavender} />
            </TouchableOpacity>
            <TextInput
              style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, color: colors.text }}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity onPress={sendText} disabled={sending} style={{ marginLeft: 8 }}>
              {sending ? <ActivityIndicator size="small" color={colors.lavender} /> : <Ionicons name="send" size={24} color={colors.lavender} />}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
