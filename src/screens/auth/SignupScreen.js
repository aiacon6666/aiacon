import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
      </TouchableOpacity>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Email or Phone" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Onboarding')}>
        <Text style={styles.btnText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14', padding: 24, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 24 },
  title: { color: '#FFF', fontSize: 36, fontWeight: '200', textAlign: 'center', marginBottom: 30, letterSpacing: 2 },
  input: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, marginBottom: 14, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#0047AB' },
  btn: { backgroundColor: '#0047AB', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  link: { color: '#00FFFF', textAlign: 'center', fontSize: 15 },
});
