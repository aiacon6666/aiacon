import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfileImage, saveUserDataToFirestore } from '../../services/backend';

const ProfilePictureScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, email, username, fullName, dob, gender, bio, song } = route.params;
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async (source) => {
    const result = await (source === 'camera' ? ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images }) : ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images }));
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleFinish = async () => {
    setUploading(true);
    try {
      let photoURL = null;
      if (image) {
        photoURL = await uploadProfileImage(image, userId);
      } else {
        photoURL = 'https://firebasestorage.googleapis.com/v0/b/aiacon.appspot.com/o/default-avatar.png?alt=media';
      }
      const userData = {
        userId,
        email,
        username,
        fullName,
        dateOfBirth: dob,
        gender,
        bio,
        song: song ? { name: song.name, url: song.uri } : null,
        profilePicture: photoURL,
        createdAt: new Date(),
        onboardingCompleted: false,
      };
      await saveUserDataToFirestore(userId, userData);
      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  const skipPicture = () => handleFinish();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#050A30' }}>
      <LinearGradient colors={['#050A30', '#0A0A14']} style={{ flex: 1, padding: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={28} color="#9F7AEA" />
        </TouchableOpacity>
        <Text style={{ fontSize: 32, color: '#FFF', fontWeight: '700', marginBottom: 8 }}>Profile picture</Text>
        <Text style={{ color: '#aaa', marginBottom: 32 }}>Add a photo or skip for default</Text>

        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
            {image ? <Image source={{ uri: image }} style={{ width: 120, height: 120 }} /> : <Ionicons name="person-circle-outline" size={80} color="#9F7AEA" />}
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => pickImage('camera')} style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 40 }}>
            <Ionicons name="camera-outline" size={28} color="#9F7AEA" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickImage('gallery')} style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 40 }}>
            <Ionicons name="images-outline" size={28} color="#9F7AEA" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleFinish} disabled={uploading} style={{ backgroundColor: '#5B4BFF', borderRadius: 30, height: 56, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{uploading ? 'Saving...' : 'Complete Signup'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={skipPicture} disabled={uploading}>
          <Text style={{ color: '#9F7AEA', textAlign: 'center' }}>Skip for now</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProfilePictureScreen;
