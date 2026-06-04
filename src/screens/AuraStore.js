import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { adjustAura, unlockAvatarItem } from '../services/backend';
import { colors } from '../theme/colors';

const storeItems = [
  { id: 'hat_1', name: 'Cyber Cap', category: 'hat', auraCost: 50, icon: 'hat' },
  { id: 'shirt_1', name: 'Neon Tee', category: 'top', auraCost: 80, icon: 'shirt' },
  { id: 'pants_1', name: 'Tech Pants', category: 'bottom', auraCost: 70, icon: 'shirt-outline' },
  { id: 'shoes_1', name: 'Glow Kicks', category: 'shoes', auraCost: 60, icon: 'footsteps' },
  { id: 'accessory_1', name: 'Aura Glasses', category: 'accessory', auraCost: 40, icon: 'eye' },
  { id: 'bg_1', name: 'Space Background', category: 'background', auraCost: 100, icon: 'planet' },
];

const AuraStore = () => {
  const { user, userData, updateUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userAura, setUserAura] = useState(userData?.aura || 0);
  const [unlocked, setUnlocked] = useState(userData?.unlockedItems || []);

  useEffect(() => {
    setUserAura(userData?.aura || 0);
    setUnlocked(userData?.unlockedItems || []);
  }, [userData]);

  const handlePurchase = async (item) => {
    if (unlocked.includes(item.id)) {
      Alert.alert('Already Owned', `You already own ${item.name}.`);
      return;
    }
    if (userAura < item.auraCost) {
      Alert.alert('Insufficient Aura', `You need ${item.auraCost} Aura. Your balance: ${userAura}`);
      return;
    }
    setLoading(true);
    try {
      await adjustAura(user.uid, -item.auraCost);
      await unlockAvatarItem(user.uid, item.id);
      // Refresh user data
      const updatedUser = { ...userData, aura: userAura - item.auraCost, unlockedItems: [...unlocked, item.id] };
      updateUserData(updatedUser);
      setUserAura(updatedUser.aura);
      setUnlocked(updatedUser.unlockedItems);
      Alert.alert('Purchased!', `You unlocked ${item.name}. Go to Avatar to equip.`);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name={item.icon} size={32} color={colors.lavender} />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
          <Text style={{ color: colors.textSecondary }}>{item.category}</Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => handlePurchase(item)}
        disabled={loading || unlocked.includes(item.id)}
        style={{ backgroundColor: unlocked.includes(item.id) ? colors.border : colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
      >
        <Text style={{ color: colors.text }}>
          {unlocked.includes(item.id) ? 'Owned' : `${item.auraCost} Aura`}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', fontFamily: 'FiraCode-Regular' }}>Aura Store</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="flash" size={20} color={colors.lavender} />
              <Text style={{ color: colors.text, marginLeft: 4, fontSize: 18 }}>{userAura > 999999 ? '∞' : userAura}</Text>
            </View>
          </View>
          <FlatList
            data={storeItems}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default AuraStore;
