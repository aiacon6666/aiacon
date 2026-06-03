import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

const PersonaScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, email, username, fullName, dob, gender } = route.params;
  const [bio, setBio] = useState('');
  const [song, setSong] = useState(null);

  const pickSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result.type === 'success') {
        setSong({ name: result.name, uri: result.uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick song');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#9F7AEA" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8 }}>Tell us about you</Text>
        <Text style={{ color: '#aaa', marginBottom: 32 }}>Bio and an optional song</Text>

        <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <TextInput placeholder="Write a short bio..." placeholderTextColor="#888" multiline numberOfLines={4} style={{ color: '#FFF', fontSize: 16, textAlignVertical: 'top' }} value={bio} onChangeText={setBio} />
        </View>

        <TouchableOpacity onPress={pickSong} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Ionicons name="musical-notes-outline" size={24} color="#9F7AEA" />
          <Text style={{ color: '#FFF', marginLeft: 12, flex: 1 }}>{song ? song.name : 'Attach a song (optional)'}</Text>
          <Ionicons name="add-circle-outline" size={24} color="#9F7AEA" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ProfilePicture', { userId, email, username, fullName, dob, gender, bio, song })} style={{ marginTop: 32, backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Next</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default PersonaScreen;
