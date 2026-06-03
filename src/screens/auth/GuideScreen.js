import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const TIPS = [
  { title: '🏠 Home', desc: 'Your personalized feed of broadcasts from friends and creators.' },
  { title: '🎬 Vids', desc: 'Short vertical videos. Swipe up for more.' },
  { title: '🔍 Discover', desc: 'AI-powered search, image & video generation, and trending content.' },
  { title: '💬 Conversations', desc: 'Chat with friends, squads, and communities.' },
  { title: '👤 Profile', desc: 'Your persona, broadcasts, vault, and settings.' },
];

export default function GuideScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Guide</Text>
      {TIPS.map((tip, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{tip.title}</Text>
          <Text style={styles.cardDesc}>{tip.desc}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Main')}>
        <Text style={styles.btnText}>Got It! Let's Go</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14', padding: 24, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '200', textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#333' },
  cardTitle: { color: '#FFF', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardDesc: { color: '#AAA', fontSize: 13 },
  btn: { backgroundColor: '#0047AB', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
});
