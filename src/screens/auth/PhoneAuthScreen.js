import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { sendPhoneOTP, signInWithPhoneOTP } from '../../services/backend';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseConfig } from '../../../firebaseConfig'; // You need to export config

const PhoneAuthScreen = () => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const recaptchaRef = useRef(null);

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Enter phone number');
      return;
    }
    setLoading(true);
    try {
      const id = await sendPhoneOTP(phoneNumber, recaptchaRef.current);
      setVerificationId(id);
      setStep('otp');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!code) {
      Alert.alert('Error', 'Enter verification code');
      return;
    }
    setLoading(true);
    try {
      await signInWithPhoneOTP(verificationId, code);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <FirebaseRecaptchaVerifierModal ref={recaptchaRef} firebaseConfig={firebaseConfig} />
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#9F7AEA" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8 }}>Phone Authentication</Text>
        <Text style={{ color: '#aaa', marginBottom: 32 }}>We'll send a verification code via SMS</Text>

        {step === 'phone' ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, marginBottom: 24 }}>
              <Ionicons name="call-outline" size={20} color="#888" />
              <TextInput
                style={{ flex: 1, color: '#FFF', marginLeft: 12 }}
                placeholder="+1234567890"
                placeholderTextColor="#888"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
            <TouchableOpacity onPress={handleSendOTP} disabled={loading} style={{ backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center' }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Send Code</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, paddingHorizontal: 16, height: 56, marginBottom: 24 }}>
              <Ionicons name="key-outline" size={20} color="#888" />
              <TextInput
                style={{ flex: 1, color: '#FFF', marginLeft: 12 }}
                placeholder="Verification code"
                placeholderTextColor="#888"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
            </View>
            <TouchableOpacity onPress={handleVerifyOTP} disabled={loading} style={{ backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center' }}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Verify & Login</Text>}
            </TouchableOpacity>
          </>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

export default PhoneAuthScreen;
