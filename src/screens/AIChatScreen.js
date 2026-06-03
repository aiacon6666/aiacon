import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AIChatScreen({ initialQuery, onBack }) {
  const [messages, setMessages] = useState([
    { id: '1', role: 'user', text: initialQuery || 'Hello AI' },
    { id: '2', role: 'ai', text: 'This is a placeholder response. AI integration coming soon.' },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now().toString(), role: 'user', text: input }]);
      setInput('');
      // Simulate AI reply
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: (Date.now()+1).toString(), role: 'ai', text: 'AI will answer here via Groq.' }]);
      }, 500);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Chat</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
      />

      {/* Image/Video generation cards (placeholder) */}
      <View style={styles.genRow}>
        <TouchableOpacity style={styles.genBtn}>
          <Ionicons name="image" size={20} color="#FFF" />
          <Text style={styles.genText}>Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.genBtn}>
          <Ionicons name="videocam" size={20} color="#FFF" />
          <Text style={styles.genText}>Video</Text>
        </TouchableOpacity>
      </View>

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Message AI..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
        />
        <TouchableOpacity onPress={send}>
          <Ionicons name="send" size={24} color="#00FFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1A1A2E', borderBottomWidth: 0.5, borderColor: '#0047AB' },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  list: { flex: 1, padding: 16 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0047AB' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#1E1E1E', borderWidth: 0.5, borderColor: '#333' },
  bubbleText: { color: '#FFF', fontSize: 16 },
  genRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: 8, borderTopWidth: 0.5, borderColor: '#333' },
  genBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  genText: { color: '#FFF', marginLeft: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#1A1A2E', borderTopWidth: 0.5, borderColor: '#333' },
  textInput: { flex: 1, backgroundColor: '#0A0A0A', borderRadius: 20, paddingHorizontal: 16, height: 44, color: '#FFF', marginRight: 10 },
});
