import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Speech from 'expo-speech-recognition';
import { colors } from '../theme/colors';
import { geminiApiKey } from '../config/keys';

const genAI = new GoogleGenerativeAI(geminiApiKey);

const GeminiLive = ({ visible, onClose, initialContext, screenData = {} }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  useEffect(() => {
    const checkVoice = async () => {
      const available = await Speech.isAvailableAsync();
      setVoiceSupported(available);
    };
    if (visible) checkVoice();
  }, [visible]);

  const sendMessage = async (text) => {
    const userText = text || query.trim();
    if (!userText) return;
    setQuery('');
    const userMessage = { role: 'user', text: userText };
    setConversation(prev => [...prev, userMessage]);
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      // Build context from screen data (e.g., video description, product info)
      let contextString = '';
      if (screenData.videoTitle) contextString += `Current video: "${screenData.videoTitle}". `;
      if (screenData.product) contextString += `Product visible: ${screenData.product.name}, price: ${screenData.product.price}. `;
      if (screenData.context) contextString += screenData.context;
      const fullPrompt = contextString ? `Context: ${contextString}\nUser: ${userText}` : userText;
      const result = await model.generateContent(fullPrompt);
      const reply = result.response.text();
      setConversation(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (error) {
      console.error(error);
      let errorMsg = 'Sorry, I encountered an error. Please try again.';
      if (error.message?.includes('API key')) errorMsg = 'Gemini API key is invalid or missing.';
      setConversation(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = async () => {
    if (!voiceSupported) {
      Alert.alert('Voice not supported', 'Speech recognition is not available on this device.');
      return;
    }
    try {
      const { granted } = await Speech.requestPermissionsAsync();
      if (!granted) {
        Alert.alert('Permission needed', 'Microphone access is required for voice input.');
        return;
      }
      setIsListening(true);
      const result = await Speech.startListeningAsync({
        onResult: (text) => {
          setQuery(text);
          setIsListening(false);
        },
        onError: (error) => {
          console.error(error);
          setIsListening(false);
        },
      });
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', zIndex: 1000 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ paddingTop: 50, paddingHorizontal: 16, flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: colors.lavender, fontSize: 18, fontWeight: '600', fontFamily: 'FiraCode-Regular' }}>Gemini Live</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {conversation.map((msg, idx) => (
              <View key={idx} style={{ marginBottom: 12, alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.role === 'user' ? colors.primary : colors.card, borderRadius: 12, padding: 10, maxWidth: '80%' }}>
                <Text style={{ color: colors.text }}>{msg.text}</Text>
              </View>
            ))}
            {loading && <ActivityIndicator size="small" color={colors.lavender} />}
          </ScrollView>
          <View style={{ flexDirection: 'row', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TextInput
              style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: colors.text, marginRight: 8 }}
              placeholder="Ask Gemini..."
              placeholderTextColor={colors.textSecondary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => sendMessage()}
            />
            {voiceSupported && (
              <TouchableOpacity onPress={startListening} style={{ justifyContent: 'center', marginRight: 8 }}>
                <Ionicons name={isListening ? "mic" : "mic-outline"} size={24} color={isListening ? colors.error : colors.lavender} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => sendMessage()} style={{ justifyContent: 'center' }}>
              <Ionicons name="send" size={24} color={colors.lavender} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default GeminiLive;
