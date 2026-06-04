import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getPublicCommunities, joinCommunity, leaveCommunity, createCommunity } from '../services/backend';
import { colors } from '../theme/colors';

const CommunitiesScreen = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setLoading(true);
    const data = await getPublicCommunities();
    setCommunities(data);
    setLoading(false);
  };

  const handleJoin = async (communityId) => {
    try {
      await joinCommunity(communityId, user.uid);
      Alert.alert('Joined', 'You have joined the community');
      loadCommunities();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLeave = async (communityId) => {
    try {
      await leaveCommunity(communityId, user.uid);
      Alert.alert('Left', 'You have left the community');
      loadCommunities();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const communityId = await createCommunity(newName, newDesc, true, user.uid);
      Alert.alert('Success', 'Community created!');
      setModalVisible(false);
      setNewName('');
      setNewDesc('');
      loadCommunities();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }) => {
    const isMember = item.members?.includes(user?.uid);
    return (
      <View style={{ backgroundColor: colors.card, margin: 8, padding: 12, borderRadius: 12 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
        <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{item.description}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <Text style={{ color: colors.lavender }}>{item.memberCount || 0} members</Text>
          <TouchableOpacity
            onPress={() => isMember ? handleLeave(item.id) : handleJoin(item.id)}
            style={{ backgroundColor: isMember ? colors.border : colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}
          >
            <Text style={{ color: colors.text }}>{isMember ? 'Leave' : 'Join'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', fontFamily: 'FiraCode-Regular' }}>Communities</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={32} color={colors.lavender} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.lavender} style={{ marginTop: 40 }} />
        ) : (
          <FlatList data={communities} renderItem={renderItem} keyExtractor={item => item.id} />
        )}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 12, width: '80%' }}>
              <Text style={{ color: colors.text, fontSize: 20, marginBottom: 16 }}>Create Community</Text>
              <TextInput style={{ backgroundColor: colors.background, borderRadius: 8, padding: 10, color: colors.text, marginBottom: 12 }} placeholder="Name" placeholderTextColor={colors.textSecondary} value={newName} onChangeText={setNewName} />
              <TextInput style={{ backgroundColor: colors.background, borderRadius: 8, padding: 10, color: colors.text, marginBottom: 20 }} placeholder="Description" placeholderTextColor={colors.textSecondary} value={newDesc} onChangeText={setNewDesc} multiline />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                  <Text style={{ color: colors.lavender }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreate} disabled={creating} style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}>
                  <Text style={{ color: colors.text }}>{creating ? 'Creating...' : 'Create'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default CommunitiesScreen;
