import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { loginWithEmailOrUsername } from '../../services/backend';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('Email');

  // Particles animation
  const particles = useRef([...Array(20)].map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 2 + Math.random() * 4,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
  }))).current;

  const particlePositions = useRef(particles.map(() => useSharedValue({ x: 0, y: 0 }))).current;

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      // Start heavy animations only after interactions are done
      setAnimationsReady(true);
    });
    const intervals = particlePositions.map((pos, idx) => {
      const p = particles[idx];
      pos.value = { x: p.x, y: p.y };
      return setInterval(() => {
        let newX = pos.value.x + p.speedX;
        let newY = pos.value.y + p.speedY;
        if (newX < 0) newX = width;
        if (newX > width) newX = 0;
        if (newY < 0) newY = height;
        if (newY > height) newY = 0;
        pos.value = { x: newX, y: newY };
      }, 50);
    });
    return () => intervals.forEach(clear => clear());
  }, []);

  // Wave animation
  const waveProgress = useSharedValue(0);
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      // Start heavy animations only after interactions are done
      setAnimationsReady(true);
    });
    waveProgress.value = withRepeat(withTiming(1, { duration: 8000 }), -1, true);
  }, []);

  const waveAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(waveProgress.value, [0, 1], [0, -width * 0.1], Extrapolate.CLAMP);
    return { transform: [{ translateX }] };
  });

  const handleLogin = async () => {
    if (loginMethod === 'Phone') {
      Alert.alert('Coming Soon', 'Phone login will be available in a future update.');
      return;
    }
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmailOrUsername(email, password);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { signInWithGoogle } = await import('../../services/backend');
      await signInWithGoogle();
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert('Google Sign-In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    try {
      const { signInWithFacebook } = await import('../../services/backend');
      await signInWithFacebook();
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert('Facebook Sign-In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInputPlaceholder = () => {
    switch (loginMethod) {
      case 'Email': return 'Enter your email';
      case 'Phone': return 'Enter your phone number';
      case 'Username': return 'Enter your username';
      default: return 'Enter your email';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Animated Background */}
            <View style={StyleSheet.absoluteFillObject}>
              <LinearGradient colors={['#050A30', '#0A0A14', '#1A1A2E']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              <View style={[styles.glow, { top: -height * 0.2, left: -width * 0.3, backgroundColor: '#9F7AEA', opacity: 0.15 }]} />
              <View style={[styles.glow, { bottom: -height * 0.2, right: -width * 0.3, backgroundColor: '#5B4BFF', opacity: 0.1 }]} />
              {particles.map((particle, idx) => {
                const animatedStyle = useAnimatedStyle(() => ({
                  position: 'absolute',
                  left: particlePositions[idx]?.value?.x ?? 0,
                  top: particlePositions[idx]?.value?.y ?? 0,
                  width: particle.size,
                  height: particle.size,
                  borderRadius: particle.size / 2,
                  backgroundColor: '#C084FC',
                  opacity: 0.6,
                }));
                return <Animated.View key={idx} style={animatedStyle} />;
              })}
              <Animated.View style={[waveAnimatedStyle, styles.waveContainer]}>
                <Svg height={height * 0.3} width={width} style={styles.waveSvg}>
                  <Defs>
                    <SvgGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#5B4BFF" stopOpacity="0.2" />
                      <Stop offset="1" stopColor="#9F7AEA" stopOpacity="0" />
                    </SvgGradient>
                  </Defs>
                  <Path d={`M0,${height * 0.2} Q${width * 0.2},${height * 0.1} ${width * 0.4},${height * 0.2} T${width},${height * 0.2} L${width},0 L0,0 Z`} fill="url(#waveGrad)" />
                  <Path d={`M0,${height * 0.25} Q${width * 0.3},${height * 0.15} ${width * 0.6},${height * 0.25} T${width},${height * 0.25} L${width},0 L0,0 Z`} fill="url(#waveGrad)" opacity="0.5" />
                </Svg>
              </Animated.View>
            </View>

            {/* Skip Button */}
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Logo Section */}
            <Animated.View entering={FadeIn.duration(800)} style={styles.logoSection}>
              <LinearGradient colors={['#9F7AEA', '#5B4BFF', '#2D1B69']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.logoGradient}>
                <Text style={styles.logoText}>AiaCon</Text>
              </LinearGradient>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#9F7AEA" />
                <Text style={styles.trustBadgeText}>Your privacy. Our priority.</Text>
              </View>
              <Text style={styles.tagline}>CONNECT. LEARN. GROW.</Text>
              <Text style={styles.subTagline}>Your AI Community. Your Future.</Text>
            </Animated.View>

            {/* Login Card */}
            <Animated.View entering={SlideInDown.duration(700).springify()} style={styles.cardContainer}>
              <BlurView intensity={80} tint="dark" style={styles.blurCard}>
                <View style={styles.cardInner}>
                  <Text style={styles.welcomeTitle}>WELCOME BACK</Text>
                  <Text style={styles.welcomeSubtitle}>Log in to continue your journey</Text>

                  {/* Segmented Control */}
                  <View style={styles.segmentedContainer}>
                    {['Email', 'Phone', 'Username'].map(method => (
                      <TouchableOpacity
                        key={method}
                        style={[styles.segment, loginMethod === method && styles.segmentActive]}
                        onPress={() => setLoginMethod(method)}
                      >
                        <Text style={[styles.segmentText, loginMethod === method && styles.segmentTextActive]}>{method}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Input Field */}
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder={getInputPlaceholder()}
                      placeholderTextColor="#888"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType={loginMethod === 'Email' ? 'email-address' : 'default'}
                    />
                  </View>

                  {/* Password Field */}
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#888"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                      <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#888" />
                    </TouchableOpacity>
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity onPress={() => Alert.alert('Reset password', 'Feature coming soon')} style={styles.forgotContainer}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity activeOpacity={0.9} onPress={handleLogin} disabled={loading}>
                    <LinearGradient colors={['#5B4BFF', '#9F7AEA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginButton}>
                      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Log In →</Text>}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Social Buttons */}
                  <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
                    <Ionicons name="logo-google" size={20} color="#fff" />
                    <Text style={styles.socialButtonText}>Continue with Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton} onPress={handleFacebookSignIn}>
                    <Ionicons name="logo-facebook" size={20} color="#fff" />
                    <Text style={styles.socialButtonText}>Continue with Facebook</Text>
                  </TouchableOpacity>

                  {/* Create Account */}
                  <TouchableOpacity style={styles.createAccountButton} onPress={() => navigation.navigate('Signup')}>
                    <Ionicons name="add-circle-outline" size={20} color="#9F7AEA" />
                    <Text style={styles.createAccountText}>Create New Account</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </Animated.View>

            {/* Footer Trust */}
            <View style={styles.footerTrust}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#888" />
              <Text style={styles.footerTrustText}>AiaCon is committed to keeping your data safe. We never share your information with third parties.</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  safeArea: { flex: 1, backgroundColor: '#050A30' },
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 20 },
  skipButton: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 10,
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  skipText: { color: '#9F7AEA', fontSize: 14, fontWeight: '600' },
  glow: { position: 'absolute', width: width * 0.6, height: width * 0.6, borderRadius: width * 0.3 },
  waveContainer: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  waveSvg: { position: 'absolute', bottom: 0 },
  logoSection: { alignItems: 'center', marginTop: height * 0.12, marginBottom: 20 },
  logoGradient: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 60 },
  logoText: { fontSize: 48, fontFamily: 'System', fontStyle: 'italic', fontWeight: '700', letterSpacing: 2, color: '#FFF', textShadowColor: '#9F7AEA', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12 },
  trustBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  trustBadgeText: { color: '#9F7AEA', marginLeft: 6, fontSize: 12 },
  tagline: { color: '#FFF', fontSize: 16, fontWeight: '600', letterSpacing: 1, marginTop: 16 },
  subTagline: { color: '#C084FC', fontSize: 12, marginTop: 4 },
  cardContainer: { flex: 1, justifyContent: 'center', marginTop: 20 },
  blurCard: { borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  cardInner: { padding: 24 },
  welcomeTitle: { color: '#9F7AEA', fontSize: 14, fontWeight: '600', letterSpacing: 1, textAlign: 'center' },
  welcomeSubtitle: { color: '#FFF', fontSize: 18, fontWeight: '500', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  segmentedContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 40, padding: 4, marginBottom: 20 },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 40, alignItems: 'center' },
  segmentActive: { backgroundColor: '#5B4BFF', shadowColor: '#5B4BFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  segmentText: { color: '#aaa', fontSize: 14, fontWeight: '500' },
  segmentTextActive: { color: '#fff' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, marginBottom: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 16 },
  eyeIcon: { padding: 8 },
  forgotContainer: { alignItems: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#9F7AEA', fontSize: 13 },
  loginButton: { height: 60, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  dividerText: { marginHorizontal: 12, color: '#aaa', fontSize: 12 },
  socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 30, height: 52, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  socialButtonText: { marginLeft: 12, color: '#fff', fontSize: 16, fontWeight: '500' },
  createAccountButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#9F7AEA', borderRadius: 40, paddingVertical: 12, marginTop: 8 },
  createAccountText: { color: '#9F7AEA', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  footerTrust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 20, marginBottom: 20 },
  footerTrustText: { color: '#888', fontSize: 10, textAlign: 'center', marginLeft: 8, flex: 1 },
};

export default LoginScreen;
