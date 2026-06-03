import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { saveUserProfile, getCurrentUser } from '../../services/backend';

export default function UsernameSetupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const next = async () => {
    if (!username.trim()) return alert('Username is required');
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await saveUserProfile(user.uid, { username: username.trim() });
      }
      navigation.navigate('DateOfBirth');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Username</Text>
      <Text style={styles.sub}>Unique across AIACON. Letters, numbers, _, ., |, °, currency symbols, emojis allowed.</Text>
      <TextInput style={styles.input} placeholder="e.g. alex_star" placeholderTextColor="#666" value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
      <TouchableOpacity style={[styles.btn, loading && {opacity:0.6}]} onPress={next} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Next'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('DateOfBirth')}>
        <Text style={styles.skipLink}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14', padding: 24, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '200', textAlign: 'center', marginBottom: 10 },
  sub: { color: '#666', textAlign: 'center', marginBottom: 30, fontSize: 13, lineHeight: 18 },
  input: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#0047AB', marginBottom: 24 },
  btn: { backgroundColor: '#0047AB', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  skipLink: { color: '#00FFFF', textAlign: 'center', fontSize: 15 },
});
