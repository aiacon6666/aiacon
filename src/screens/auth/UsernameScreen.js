import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/backend';
import Colors from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

function UsernameScreen({ navigation, route }) {
  const { uid, email } = route.params || {};
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);

  async function handleContinue() {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (clean.length < 3) {
      Alert.alert('Username must be at least 3 characters');
      return;
    }
    setChecking(true);
    try {
      const q = query(collection(db, 'users'), where('username', '==', clean));
      const snap = await getDocs(q);
      if (!snap.empty) {
        Alert.alert('Username taken', 'Choose a different one.');
        return;
      }
      navigation.navigate('FullName', { uid, email, username: clean });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.step}>Step 1 of 6</Text>
      <Text style={styles.title}>Pick a username</Text>
      <Text style={styles.subtitle}>This is how others will find you on AiaCon.</Text>

      <View style={styles.inputWrap}>
        <Text style={styles.atSign}>@</Text>
        <TextInput
          style={styles.input}
          placeholder="your_username"
          placeholderTextColor={Colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <Text style={styles.hint}>Only letters, numbers, dots and underscores.</Text>

      <TouchableOpacity style={styles.btn} onPress={handleContinue} disabled={checking}>
        {checking ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.btnText}>Continue</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24, paddingTop: 70 },
  back: { position: 'absolute', top: 50, left: 20 },
  step: { color: Colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 12, marginTop: 20, fontFamily: 'FiraCode-Regular' },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700', marginBottom: 6, fontFamily: 'FiraCode-Regular' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 28, fontFamily: 'FiraCode-Regular' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: Colors.border,
  },
  atSign: { color: Colors.accent, fontSize: 18, marginRight: 6, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
  input: { flex: 1, color: Colors.text, fontSize: 16, fontFamily: 'FiraCode-Regular' },
  hint: { color: Colors.textSecondary, fontSize: 12, marginTop: 8, marginBottom: 28, fontFamily: 'FiraCode-Regular' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default UsernameScreen;
