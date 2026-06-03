import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { saveUserProfile, getCurrentUser } from '../../services/backend';

export default function AccountTypeScreen({ navigation }) {
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(false);

  const next = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await saveUserProfile(user.uid, { isPrivate: type === 'private' });
      }
      navigation.navigate('UsernameSetup');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Privacy</Text>
      <TouchableOpacity style={[styles.card, type === 'public' && styles.cardSelected]} onPress={() => setType('public')}>
        <Text style={styles.cardTitle}>🌍 Public Account</Text>
        <Text style={styles.cardDesc}>Anyone can see your profile and posts.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.card, type === 'private' && styles.cardSelected]} onPress={() => setType('private')}>
        <Text style={styles.cardTitle}>🔒 Private Account</Text>
        <Text style={styles.cardDesc}>Only approved followers can see your content.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, (!type || loading) && styles.btnDisabled]} onPress={next} disabled={!type || loading}>
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Continue'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('UsernameSetup')}>
        <Text style={styles.skipLink}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14', padding: 24, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '200', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  cardSelected: { borderColor: '#0047AB', borderWidth: 2 },
  cardTitle: { color: '#FFF', fontSize: 20, fontWeight: '600', marginBottom: 8 },
  cardDesc: { color: '#AAA', fontSize: 14 },
  btn: { backgroundColor: '#0047AB', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  skipLink: { color: '#00FFFF', textAlign: 'center', marginTop: 16, fontSize: 15 },
});
