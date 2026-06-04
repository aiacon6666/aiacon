import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, userData } = useAuth();
  const auraValue = userData?.aura || 0;
  const displayAura = auraValue > 999999 ? '∞' : auraValue.toString();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1, padding: 20 }}>
        <ScrollView>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            {userData?.profilePicture ? (
              <Image source={{ uri: userData.profilePicture }} style={{ width: 100, height: 100, borderRadius: 50 }} />
            ) : (
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.card, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="person" size={60} color={colors.lavender} />
              </View>
            )}
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 8, fontFamily: 'FiraCode-Regular' }}>{userData?.fullName || user?.email}</Text>
            <Text style={{ color: colors.lavender, marginBottom: 4 }}>@{userData?.username}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Ionicons name="flash" size={20} color={colors.lavender} />
              <Text style={{ color: colors.text, fontSize: 18, marginLeft: 4 }}>{displayAura} Aura</Text>
            </View>
          </View>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 30, marginBottom: 16, alignItems: 'center' }}
            onPress={() => navigation.navigate('AvatarCreator')}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>Create / Edit Avatar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 30, marginBottom: 16, alignItems: 'center' }}
            onPress={() => navigation.navigate('AuraStore')}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>Aura Store (Unlock Items)</Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.secondary, padding: 16, borderRadius: 30, marginBottom: 16, alignItems: "center" }}
            onPress={() => navigation.navigate("Squads")}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>My Squads (Group Chats)</Text>
          </TouchableOpacity>
          </TouchableOpacity>
          <View style={{ backgroundColor: colors.card, padding: 16, borderRadius: 12 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Statistics</Text>
            <Text style={{ color: colors.textSecondary }}>Followers: {userData?.followers?.length || 0}</Text>
            <Text style={{ color: colors.textSecondary }}>Following: {userData?.following?.length || 0}</Text>
            <Text style={{ color: colors.textSecondary }}>Posts: {userData?.postCount || 0}</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProfileScreen;
