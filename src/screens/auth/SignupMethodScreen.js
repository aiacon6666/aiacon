import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signInWithGoogle, signInWithFacebook } from '../../services/backend';

const SignupMethodScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert('Google Sign-In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebook = async () => {
    setLoading(true);
    try {
      await signInWithFacebook();
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert('Facebook Sign-In Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = () => {
    navigation.navigate('EmailSignup');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14', '#1A1A2E']} style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 48, fontFamily: 'System', fontStyle: 'italic', fontWeight: '700', color: '#FFF', textShadowColor: '#9F7AEA', textShadowRadius: 12 }}>AiaCon</Text>
          <Text style={{ color: '#9F7AEA', marginTop: 8 }}>Join the future of AI social networking</Text>
        </View>

        <TouchableOpacity onPress={handleGoogle} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 30, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
          <Ionicons name="logo-google" size={24} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', marginLeft: 12 }}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleFacebook} style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 30, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
          <Ionicons name="logo-facebook" size={24} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500', marginLeft: 12 }}>Continue with Facebook</Text>
        <TouchableOpacity onPress={() => navigation.navigate("PhoneAuth")} style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 30, height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
          <Ionicons name="call-outline" size={24} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "500", marginLeft: 12 }}>Continue with Phone</Text>
        </TouchableOpacity>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          <Text style={{ marginHorizontal: 12, color: '#aaa' }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </View>

        <TouchableOpacity onPress={handleEmail} style={{ backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Sign up with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ color: '#9F7AEA' }}>Already have an account? Log in</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator style={{ position: 'absolute', alignSelf: 'center', bottom: 40 }} color="#9F7AEA" />}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default SignupMethodScreen;
