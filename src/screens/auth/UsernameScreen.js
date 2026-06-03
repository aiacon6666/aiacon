import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { isUsernameTaken } from '../../services/backend';

const UsernameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, email } = route.params || {};
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (username.length < 3) {
        setIsAvailable(null);
        return;
      }
      setChecking(true);
      const taken = await isUsernameTaken(username);
      setIsAvailable(!taken);
      setChecking(false);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [username]);

  const handleNext = () => {
    if (!username || username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    if (isAvailable !== true) {
      Alert.alert('Error', 'Username is not available');
      return;
    }
    navigation.navigate('FullName', { userId, email, username });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#9F7AEA" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8 }}>Choose username</Text>
        <Text style={{ color: '#aaa', marginBottom: 32 }}>This will be your unique handle</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ color: '#9F7AEA', fontSize: 16 }}>@</Text>
          <TextInput placeholder="username" placeholderTextColor="#888" style={{ flex: 1, color: '#FFF', marginLeft: 8 }} value={username} onChangeText={setUsername} autoCapitalize="none" />
          {checking && <ActivityIndicator size="small" color="#9F7AEA" />}
          {!checking && username.length >= 3 && (
            <Ionicons name={isAvailable ? 'checkmark-circle' : 'close-circle'} size={24} color={isAvailable ? '#00FF00' : '#FF4444'} />
          )}
        </View>
        {username.length >= 3 && isAvailable === false && <Text style={{ color: '#FF4444', marginTop: 8 }}>Username already taken</Text>}
        {username.length >= 3 && isAvailable === true && <Text style={{ color: '#00FF00', marginTop: 8 }}>Available!</Text>}

        <TouchableOpacity onPress={handleNext} disabled={isAvailable !== true} style={{ marginTop: 32, backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', opacity: isAvailable === true ? 1 : 0.5 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Next</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default UsernameScreen;
