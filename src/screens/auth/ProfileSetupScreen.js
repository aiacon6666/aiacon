import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { saveUserProfile, getCurrentUser, uploadProfilePhoto } from '../../services/backend';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileSetupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [username, setUsername] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const next = async () => {
    setLoading(true);
    try {
      const user = getCurrentUser();
      if (user) {
        if (photoUri) await uploadProfilePhoto(user.uid, { uri: photoUri, name: 'profile.jpg', extension: 'jpg' });
        await saveUserProfile(user.uid, { name, persona, username });
      }
      navigation.navigate('Guide');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      {/* Profile Picture */}
      <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
        {photoUri ? <Image source={{ uri: photoUri }} style={styles.avatar} /> : <View style={styles.avatar}><Text style={styles.avatarText}>+</Text></View>}
        <Text style={styles.avatarLabel}>{photoUri ? 'Change Photo' : 'Add Profile Picture'}</Text>
      </TouchableOpacity>
      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} placeholder="Your full name" placeholderTextColor="#666" value={name} onChangeText={setName} />
      {/* Username (editable) */}
      <Text style={styles.label}>Username <Text style={{color:'#00FFFF', fontSize:12}}>(tap pencil to edit)</Text></Text>
      <View style={styles.usernameRow}>
        <TextInput style={[styles.input, {flex:1}]} placeholder="Username" placeholderTextColor="#666" value={username} onChangeText={setUsername} />
        <TouchableOpacity><Text style={{color:'#00FFFF', marginLeft:10, fontSize:20}}>✎</Text></TouchableOpacity>
      </View>
      {/* Persona (Bio) */}
      <Text style={styles.label}>Persona (Bio)</Text>
      <TextInput style={[styles.input, {height:80}]} placeholder="Write a short bio..." placeholderTextColor="#666" value={persona} onChangeText={setPersona} multiline />
      <TouchableOpacity style={[styles.btn, loading && {opacity:0.6}]} onPress={next} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Saving...' : 'Next'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Guide')}>
        <Text style={styles.skipLink}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#0A0A14', padding: 24, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '200', textAlign: 'center', marginBottom: 24 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1A1A2E', borderWidth: 2, borderColor: '#0047AB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#00FFFF', fontSize: 40 },
  avatarLabel: { color: '#00FFFF', marginTop: 8, fontSize: 14 },
  label: { color: '#AAA', marginBottom: 8, fontSize: 14, marginTop: 16 },
  input: { backgroundColor: '#1A1A2E', borderRadius: 14, padding: 16, color: '#FFF', fontSize: 16, borderWidth: 1, borderColor: '#0047AB' },
  usernameRow: { flexDirection: 'row', alignItems: 'center' },
  btn: { backgroundColor: '#0047AB', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 24, marginBottom: 16 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 18 },
  skipLink: { color: '#00FFFF', textAlign: 'center', fontSize: 15 },
});
