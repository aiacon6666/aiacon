import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';

function PersonaScreen({ navigation, route }) {
  const params = route.params || {};
  const [bio, setBio] = useState('');
  const [link, setLink] = useState('');

  function handleContinue() {
    navigation.navigate('ProfilePicture', { ...params, bio: bio.trim(), link: link.trim() });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.step}>Step 5 of 6</Text>
      <Text style={styles.title}>Your Persona</Text>
      <Text style={styles.subtitle}>Tell the world who you are.</Text>

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Write a short bio..."
        placeholderTextColor={Colors.textSecondary}
        value={bio}
        onChangeText={setBio}
        multiline
        maxLength={150}
      />
      <Text style={styles.charCount}>{bio.length}/150</Text>

      <Text style={styles.label}>Website / Link</Text>
      <TextInput
        style={styles.input}
        placeholder="https://yoursite.com"
        placeholderTextColor={Colors.textSecondary}
        value={link}
        onChangeText={setLink}
        autoCapitalize="none"
        keyboardType="url"
      />

      <TouchableOpacity style={styles.skipBtn} onPress={handleContinue}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={handleContinue}>
        <Text style={styles.btnText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: 24, paddingTop: 70 },
  back: { position: 'absolute', top: 20, left: 0 },
  step: { color: Colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 12, marginTop: 20, fontFamily: 'FiraCode-Regular' },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700', marginBottom: 6, fontFamily: 'FiraCode-Regular' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 28, fontFamily: 'FiraCode-Regular' },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'FiraCode-Regular' },
  input: {
    backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
    color: Colors.text, fontSize: 15, borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
    textAlignVertical: 'top', fontFamily: 'FiraCode-Regular',
  },
  charCount: { color: Colors.textSecondary, fontSize: 11, textAlign: 'right', marginBottom: 20, fontFamily: 'FiraCode-Regular' },
  skipBtn: { alignItems: 'center', marginBottom: 10, paddingVertical: 10 },
  skipText: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'FiraCode-Regular' },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default PersonaScreen;
