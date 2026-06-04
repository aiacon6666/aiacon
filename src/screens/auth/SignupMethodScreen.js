import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';

const METHODS = [
  { label: 'Continue with Email', icon: 'mail', screen: 'EmailSignup', color: Colors.primary },
  { label: 'Continue with Google', icon: 'logo-google', screen: null, color: '#DB4437' },
  { label: 'Continue with Facebook', icon: 'logo-facebook', screen: null, color: '#1877F2' },
];

function SignupMethodScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A14', '#0D0D24']} style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={styles.logo}>AiaCon</Text>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Choose how you want to join</Text>

      <View style={styles.methodsWrap}>
        {METHODS.map((m, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.methodBtn, { borderColor: m.color }]}
            onPress={() => {
              if (m.screen) navigation.navigate(m.screen);
              else alert(`${m.label} – configure OAuth in keys.js`);
            }}
          >
            <Ionicons name={m.icon} size={22} color={m.color} />
            <Text style={[styles.methodText, { color: m.color }]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backBtn: {
    position: 'absolute',
    top: 54,
    left: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    fontStyle: 'italic',
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'FiraCode-Regular',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    fontFamily: 'FiraCode-Regular',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 40,
    fontFamily: 'FiraCode-Regular',
  },
  methodsWrap: {
    width: '100%',
  },
  methodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  methodText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 14,
    fontFamily: 'FiraCode-Regular',
  },
});

export default SignupMethodScreen;
