import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { sendMessage, listenMessages } from '../services/backend';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { uploadToTelegram, getTelegramFileUrl } from '../services/telegramStorage';

function ChatScreen({ navigation, route }) {
  const params = route.params || {};
  const convId = params.convId || 'default';
  const chatName = params.name || 'Chat';
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsub = listenMessages(convId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [convId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    try {
      await sendMessage(convId, user.uid, text, '');
    } finally {
      setSending(false);
    }
  }

  async function handleAttach() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSending(true);
      try {
        const uploaded = await uploadToTelegram(result.assets[0].uri, 'image');
        const url = await getTelegramFileUrl(uploaded.fileId);
        await sendMessage(convId, user.uid, '', url);
      } finally {
        setSending(false);
      }
    }
  }

  function isMe(msg) {
    return user && msg.senderId === user.uid;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerName}>{chatName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={{ marginLeft: 12 }}>
            <Ionicons name="call-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 12 }}>
            <Ionicons name="videocam-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const mine = isMe(item);
            return (
              <View style={[styles.bubble, mine ? styles.myBubble : styles.theirBubble]}>
                {item.mediaUrl ? <Text style={styles.mediaLabel}>📎 Image</Text> : null}
                {item.text ? <Text style={[styles.bubbleText, mine && styles.myBubbleText]}>{item.text}</Text> : null}
                {mine && <Text style={styles.tick}>{item.read ? '✓✓' : '✓'}</Text>}
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={handleAttach}>
            <Ionicons name="attach" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            placeholderTextColor={Colors.textSecondary}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
            <Ionicons name="send" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerName: { flex: 1, color: Colors.text, fontSize: 17, fontWeight: '700', marginLeft: 12, fontFamily: 'FiraCode-Regular' },
  headerActions: { flexDirection: 'row' },
  messageList: { padding: 12 },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 10, marginVertical: 3 },
  myBubble: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: Colors.card, alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { color: Colors.text, fontSize: 14, lineHeight: 19, fontFamily: 'FiraCode-Regular' },
  myBubbleText: { color: '#fff' },
  mediaLabel: { color: Colors.textSecondary, fontSize: 13, fontFamily: 'FiraCode-Regular' },
  tick: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textAlign: 'right', marginTop: 2, fontFamily: 'FiraCode-Regular' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.card },
  attachBtn: { padding: 6, marginRight: 4 },
  textInput: { flex: 1, color: Colors.text, fontSize: 14, maxHeight: 100, paddingVertical: 6, paddingHorizontal: 4, fontFamily: 'FiraCode-Regular' },
  sendBtn: { backgroundColor: Colors.primary, borderRadius: 22, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});

export default ChatScreen;
