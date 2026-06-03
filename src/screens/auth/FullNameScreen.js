import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const FullNameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, email, username } = route.params;
  const [fullName, setFullName] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#9F7AEA" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8 }}>Your full name</Text>
        <Text style={{ color: '#aaa', marginBottom: 32 }}>As you want it to appear</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Ionicons name="person-outline" size={20} color="#888" />
          <TextInput placeholder="Full name" placeholderTextColor="#888" style={{ flex: 1, color: '#FFF', marginLeft: 12 }} value={fullName} onChangeText={setFullName} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('DateOfBirth', { userId, email, username, fullName })} disabled={!fullName} style={{ marginTop: 32, backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', opacity: fullName ? 1 : 0.5 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Next</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default FullNameScreen;
