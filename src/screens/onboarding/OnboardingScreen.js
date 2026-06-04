import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../theme/colors';

const SCREEN_W = Dimensions.get('window').width;

const SLIDES = [
  { emoji: '🌌', title: 'Welcome to AiaCon', subtitle: 'A new social universe powered by AI, community, and creative energy.' },
  { emoji: '✨', title: 'Earn Aura', subtitle: 'Create content, engage, and gift Aura to people who inspire you.' },
  { emoji: '🤖', title: 'AI-Powered Hub', subtitle: 'Chat with Gemini AI, generate images, search smarter.' },
  { emoji: '🌍', title: 'Explore the World', subtitle: 'Step into a 3D multiplayer space and vibe with your community.' },
];

function OnboardingScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  function handleNext() {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      navigation.replace('Auth');
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A14', '#0D0D24', '#0A0A14']} style={StyleSheet.absoluteFill} />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
        <Text style={styles.nextText}>{activeIndex === SLIDES.length - 1 ? "Let's Go 🚀" : 'Next'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace('Auth')} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  slide: { width: SCREEN_W, flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emoji: { fontSize: 80, marginBottom: 24 },
  slideTitle: { color: Colors.text, fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 14, fontFamily: 'FiraCode-Regular' },
  slideSubtitle: { color: Colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 24, fontFamily: 'FiraCode-Regular' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border, marginHorizontal: 4 },
  dotActive: { backgroundColor: Colors.accent, width: 20 },
  nextBtn: { backgroundColor: Colors.primary, borderRadius: 14, marginHorizontal: 24, paddingVertical: 15, alignItems: 'center', marginBottom: 12 },
  nextText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
  skipBtn: { alignItems: 'center', marginBottom: 30 },
  skipText: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'FiraCode-Regular' },
});

export default OnboardingScreen;
