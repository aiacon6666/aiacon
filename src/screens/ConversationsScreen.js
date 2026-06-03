import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ConversationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Conversations</Text>
      <Text style={styles.sub}>Chat system coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#FFFFFF', fontSize: 24, fontWeight: '600' },
  sub: { color: '#888', fontSize: 14, marginTop: 8 },
});
