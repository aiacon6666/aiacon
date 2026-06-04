import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

function EmailSignupScreen({ navigation }) {
  const { signupEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleContinue() {
    if (!email.trim() || !password || !confirm) {
      Alert.alert('Fill all fields');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const u = await signupEmail(email.trim(), password);
      navigation.navigate('Username', { uid: u.uid, email: email.trim() });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Your Email</Text>
        <Text style={styles.subtitle}>We'll use this to secure your account</Text>

        <View style={styles.inputWrap}>
          <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={Colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrap}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor={Colors.textSecondary}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPass}
          />
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.continueBtnText}>Continue →</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: 24, paddingTop: 70 },
  backBtn: { position: 'absolute', top: 20, left: 0 },
  title: { color: Colors.text, fontSize: 26, fontWeight: '700', marginBottom: 6, marginTop: 30, fontFamily: 'FiraCode-Regular' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginBottom: 28, fontFamily: 'FiraCode-Regular' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    marginBottom: 14, borderWidth: 1, borderColor: Colors.border,
  },
  input: { flex: 1, color: Colors.text, fontSize: 15, fontFamily: 'FiraCode-Regular' },
  continueBtn: {
    backgroundColor: Colors.primary, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  continueBtnText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default EmailSignupScreen;
