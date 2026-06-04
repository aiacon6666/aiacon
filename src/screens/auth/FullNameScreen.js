import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';

function FullNameScreen({ navigation, route }) {
  const params = route.params || {};
  const [name, setName] = useState('');

  function handleContinue() {
    if (name.trim().length < 2) {
      Alert.alert('Enter your full name');
      return;
    }
    navigation.navigate('DateOfBirth', { ...params, displayName: name.trim() });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.step}>Step 2 of 6</Text>
      <Text style={styles.title}>What's your name?</Text>
      <Text style={styles.subtitle}>This is how you'll appear on AiaCon.</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor={Colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.btn} onPress={handleContinue}>
        <Text style={styles.btnText}>Continue</Text>
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
  input: {
    backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.text, fontSize: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 28,
    fontFamily: 'FiraCode-Regular',
  },
  btn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default FullNameScreen;
