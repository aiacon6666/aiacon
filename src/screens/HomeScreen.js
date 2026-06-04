import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AboutStories from '../components/AboutStories';
import SectionTabs from '../components/SectionTabs';
import GeminiLive from '../components/GeminiLive';

const HomeScreen = () => {
  const [geminiVisible, setGeminiVisible] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, position: 'relative' }}>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', fontFamily: 'FiraCode-Regular' }}>AiaCon</Text>
          <TouchableOpacity onPress={() => setGeminiVisible(true)} style={{ position: 'absolute', right: 16 }}>
            <Ionicons name="search-outline" size={24} color={colors.lavender} />
          </TouchableOpacity>
        </View>
        <AboutStories />
        <SectionTabs />
      </LinearGradient>
      <GeminiLive visible={geminiVisible} onClose={() => setGeminiVisible(false)} />
    </SafeAreaView>
  );
};

export default HomeScreen;
