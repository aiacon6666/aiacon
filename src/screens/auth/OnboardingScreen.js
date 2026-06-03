import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { saveUserProfile, getCurrentUser } from '../../services/backend';

export default function OnboardingScreen({ navigation }) {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const next = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (user) {
        await saveUserProfile(user.uid, { accountType: selected });
      }
      if (selected === 'creator') navigation.navigate('CreatorFields');
      else navigation.navigate('AccountType');
    } catch (e) {
      alert('Error saving: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Path</Text>
      <TouchableOpacity style={[styles.card, selected === 'creator' && styles.cardSelected]} onPress={() => setSelected('creator')}>
        <Text style={styles.cardTitle}>🎨 Creative Account</Text>
        <Text style={styles.cardDesc}>For artists, musicians, influencers. Share your content with the world.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.card, selected === 'user' && styles.cardSelected]} onPress={() => setSelected('user')}>
        <Text style={styles.cardTitle}>👤 User Account</Text>
        <Text style={styles.cardDesc}>Connect with friends, discover content, join communities.</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, (!selected || loading) && styles.btnDisabled]} onPress={next} disabled={!selected || loading}>
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A14', padding: 24, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '200', textAlign: 'center', marginBottom: 30, letterSpacing: 2 },
  card: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#333' },
  cardSelected: { borderColor: '#0047AB', borderWidth: 2, backgroundColor: '#1A1A40' },
  cardTitle: { color: '#FFF', fontSize: 20, fontWeight: '600', marginBottom: 8 },
  cardDesc: { color: '#AAA', fontSize: 14 },
  btn: { backgroundColor: '#0047AB', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
});
