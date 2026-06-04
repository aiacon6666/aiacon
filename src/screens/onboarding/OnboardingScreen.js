import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { completeOnboarding } from '../../services/backend';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const slides = [
  { id: '1', title: 'Welcome to AiaCon', subtitle: 'Connect. Learn. Grow.', description: 'Your AI-powered social network.', icon: 'rocket-outline', color: '#9F7AEA' },
  { id: '2', title: 'Your Feed', subtitle: 'Stay in the loop', description: 'Discover posts, stories, and AI recommendations.', icon: 'newspaper-outline', color: '#5B4BFF' },
  { id: '3', title: 'Express Yourself', subtitle: 'Profiles & Personas', description: 'Customize your profile with a unique persona, bio, and even a song.', icon: 'person-circle-outline', color: '#C084FC' },
  { id: '4', title: 'Join Communities', subtitle: 'Find your tribe', description: 'Create or join AI-focused communities.', icon: 'people-outline', color: '#00FFFF' },
  { id: '5', title: 'Privacy First', subtitle: 'Your data is safe', description: 'End-to-end encryption and full control.', icon: 'shield-checkmark-outline', color: '#9F7AEA' },
  { id: '6', title: 'AI Superpowers', subtitle: 'Smart features', description: 'Music discovery, smart replies, and recommendations.', icon: 'flash-outline', color: '#5B4BFF' },
  { id: '7', title: 'Ready to Begin?', subtitle: 'Enter AiaCon', description: 'Your journey starts now.', icon: 'checkmark-circle-outline', color: '#00FFFF' },
];
const OnboardingScreen = () => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleComplete = async () => {
    await completeOnboarding();
    await AsyncStorage.setItem('onboardingCompleted', 'true');
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };
  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else handleComplete();
  };
  const renderItem = ({ item }) => (
    <View style={{ width, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: item.color, justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
        <Ionicons name={item.icon} size={64} color="#fff" />
      </View>
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 12 }}>{item.title}</Text>
      <Text style={{ fontSize: 18, color: '#9F7AEA', textAlign: 'center', marginBottom: 16 }}>{item.subtitle}</Text>
      <Text style={{ fontSize: 16, color: '#aaa', textAlign: 'center', paddingHorizontal: 20 }}>{item.description}</Text>
    </View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 24, paddingTop: 20 }}>
          <TouchableOpacity onPress={handleComplete}><Text style={{ color: '#9F7AEA' }}>Skip</Text></TouchableOpacity>
        </View>
        <FlatList ref={flatListRef} data={slides} renderItem={renderItem} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={e => setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width))} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 30 }}>
          {slides.map((_, i) => <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === currentIndex ? '#9F7AEA' : '#333', marginHorizontal: 4 }} />)}
        </View>
        <TouchableOpacity onPress={goNext} style={{ marginHorizontal: 24, marginBottom: 40 }}>
          <LinearGradient colors={['#5B4BFF', '#9F7AEA']} style={{ padding: 16, borderRadius: 30, alignItems: 'center' }}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>{currentIndex === slides.length - 1 ? 'Enter AiaCon' : 'Next'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};
export default OnboardingScreen;
