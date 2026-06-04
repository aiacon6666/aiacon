import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, Dimensions, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const SCREEN_W = Dimensions.get('window').width;
const SCREEN_H = Dimensions.get('window').height;

// Particles configuration
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * SCREEN_W,
  y: Math.random() * SCREEN_H,
  size: 2 + Math.random() * 4,
  speed: 0.4 + Math.random() * 0.8,
}));

function Particle({ particle }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = () => {
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: (6000 + particle.id * 300) / particle.speed,
        useNativeDriver: true,
      }).start(loop);
    };
    loop();
  }, []);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_H, -60],
  });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: particle.x,
        width: particle.size,
        height: particle.size,
        borderRadius: particle.size / 2,
        backgroundColor: Colors.accent,
        opacity: 0.5,
        transform: [{ translateY }],
      }}
    />
  );
}

function LoginScreen({ navigation }) {
  const { loginEmail, loginGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, { toValue: 1, delay: 200, useNativeDriver: true }).start();
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Oops', 'Please fill in email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginEmail(email.trim(), password);
    } catch (e) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setLoading(true);
    try {
      await loginGuest();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0A14', '#0D0D24', '#0A0A14']} style={StyleSheet.absoluteFill} />
      {PARTICLES.map(p => <Particle key={p.id} particle={p} />)}

      <KeyboardAvoidingView style={styles.inner} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.View style={[styles.logoWrap, { opacity: logoAnim, transform: [{ scale: logoAnim }] }]}>
          <Text style={styles.logoText}>AiaCon</Text>
          <Text style={styles.tagline}>Connect. Create. Shine.</Text>
        </Animated.View>

        <BlurView intensity={20} tint="dark" style={styles.card}>
          <View style={styles.cardInner}>
            <Text style={styles.cardTitle}>Welcome Back</Text>

            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={Colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
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

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotWrap}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color={Colors.text} /> : <Text style={styles.loginBtnText}>Sign In</Text>}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.guestBtn} onPress={handleGuest} disabled={loading}>
              <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>New here? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignupMethod')}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    fontStyle: 'italic',
    color: Colors.text,
    letterSpacing: 2,
    textShadowColor: Colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    fontFamily: 'FiraCode-Regular',
  },
  tagline: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, letterSpacing: 3, fontFamily: 'FiraCode-Regular' },
  card: { width: '100%', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardInner: { padding: 24, backgroundColor: Colors.cardGlass },
  cardTitle: { color: Colors.text, fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center', fontFamily: 'FiraCode-Regular' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: Colors.text, fontSize: 15, fontFamily: 'FiraCode-Regular' },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 18 },
  forgotText: { color: Colors.accent, fontSize: 13, fontFamily: 'FiraCode-Regular' },
  loginBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  loginBtnText: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  divider: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { color: Colors.textSecondary, marginHorizontal: 12, fontSize: 13, fontFamily: 'FiraCode-Regular' },
  guestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingVertical: 12, marginBottom: 20 },
  guestBtnText: { color: Colors.textSecondary, marginLeft: 8, fontSize: 15, fontFamily: 'FiraCode-Regular' },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupPrompt: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'FiraCode-Regular' },
  signupLink: { color: Colors.accent, fontSize: 14, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
});

export default LoginScreen;
