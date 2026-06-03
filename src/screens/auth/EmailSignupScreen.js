import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmail } from '../../services/backend';

const EmailSignupScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await createUserWithEmail(email, password);
      navigation.replace('UsernameSetup', { userId: user.uid, email: user.email });
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#9F7AEA" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8 }}>Create account</Text>
        <Text style={{ color: '#aaa', marginBottom: 32 }}>Sign up with email and password</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Ionicons name="mail-outline" size={20} color="#888" />
          <TextInput placeholder="Email" placeholderTextColor="#888" style={{ flex: 1, color: '#FFF', marginLeft: 12 }} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" />
          <TextInput placeholder="Password" placeholderTextColor="#888" style={{ flex: 1, color: '#FFF', marginLeft: 12 }} secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" /></TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" />
          <TextInput placeholder="Confirm Password" placeholderTextColor="#888" style={{ flex: 1, color: '#FFF', marginLeft: 12 }} secureTextEntry={!showConfirm} value={confirmPassword} onChangeText={setConfirmPassword} />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}><Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" /></TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSignup} disabled={loading} style={{ backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center' }}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Sign Up</Text>}
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default EmailSignupScreen;
