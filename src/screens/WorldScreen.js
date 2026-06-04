import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { ablyApiKey } from '../config/keys';

const WorldScreen = () => {
  const { user, userData } = useAuth();
  const [chatVisible, setChatVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const webviewRef = useRef(null);

  const injectedJavaScript = `
    window.userId = '${user?.uid}';
    window.username = '${userData?.username || 'anon'}';
    window.ablyApiKey = '${ablyApiKey}';
    true;
  `;

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      username: userData?.username || 'anon',
      text: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    webviewRef.current?.injectJavaScript(`
      if (window.broadcastChat) {
        window.broadcastChat('${message.replace(/'/g, "\\'")}');
      }
    `);
    setMessage('');
  };

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data.message]);
      }
    } catch (e) {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <WebView
        ref={webviewRef}
        source={require('../assets/world/index.html')}
        style={{ flex: 1 }}
        injectedJavaScript={injectedJavaScript}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
      />
      {chatVisible && (
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.85)', padding: 10 }}>
          <FlatList
            data={messages.slice(-20)}
            renderItem={({ item }) => (
              <Text style={{ color: colors.text }}>
                <Text style={{ color: colors.lavender }}>@{item.username}</Text>: {item.text}
              </Text>
            )}
            keyExtractor={item => item.id}
            style={{ maxHeight: 150 }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
            <TextInput
              style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 8, color: colors.text }}
              placeholder="Chat message..."
              placeholderTextColor={colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity onPress={handleSendMessage} style={{ marginLeft: 8 }}>
              <Ionicons name="send" size={24} color={colors.lavender} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <TouchableOpacity
        onPress={() => setChatVisible(!chatVisible)}
        style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: colors.primary, borderRadius: 30, padding: 12 }}
      >
        <Ionicons name="chatbubble" size={24} color={colors.text} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WorldScreen;
