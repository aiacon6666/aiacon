import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const GenderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, email, username, fullName, dob } = route.params;
  const [gender, setGender] = useState('');
  const [customGender, setCustomGender] = useState('');

  const options = ['Male', 'Female', 'Custom'];
  const selected = gender === 'Custom' ? customGender : gender;

  const handleNext = () => {
    let finalGender = gender;
    if (gender === 'Custom' && customGender) finalGender = customGender;
    if (!finalGender) return;
    navigation.navigate('Persona', { userId, email, username, fullName, dob, gender: finalGender });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#9F7AEA" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8 }}>Gender</Text>
        <Text style={{ color: '#aaa', marginBottom: 32 }}>This helps us personalize recommendations</Text>

        {options.map(opt => (
          <TouchableOpacity key={opt} onPress={() => setGender(opt)} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, marginBottom: 12, borderWidth: 1, borderColor: gender === opt ? '#5B4BFF' : 'rgba(255,255,255,0.1)' }}>
            <Ionicons name={gender === opt ? 'radio-button-on' : 'radio-button-off'} size={24} color="#9F7AEA" />
            <Text style={{ color: '#FFF', marginLeft: 12 }}>{opt}</Text>
          </TouchableOpacity>
        ))}

        {gender === 'Custom' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            <TextInput placeholder="Enter your gender" placeholderTextColor="#888" style={{ flex: 1, color: '#FFF' }} value={customGender} onChangeText={setCustomGender} />
          </View>
        )}

        <TouchableOpacity onPress={handleNext} disabled={!gender || (gender === 'Custom' && !customGender)} style={{ marginTop: 32, backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', opacity: (gender && (gender !== 'Custom' || customGender)) ? 1 : 0.5 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Next</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default GenderScreen;
