import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getUserSquads, createSquad, sendSquadMessage, subscribeToSquadMessages } from '../services/backend';
import { colors } from '../theme/colors';

const SquadsScreen = () => {
  const { user, userData } = useAuth();
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadMembers, setNewSquadMembers] = useState('');
  const [creating, setCreating] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  let unsubscribe = null;

  useEffect(() => {
    loadSquads();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const loadSquads = async () => {
    const data = await getUserSquads(user.uid);
    setSquads(data);
    setLoading(false);
  };

  const handleCreateSquad = async () => {
    if (!newSquadName.trim()) return;
    const memberIds = newSquadMembers.split(',').map(m => m.trim()).filter(m => m);
    memberIds.push(user.uid);
    setCreating(true);
    try {
      await createSquad(newSquadName, memberIds, user.uid);
      Alert.alert('Success', 'Squad created');
      setModalVisible(false);
      setNewSquadName('');
      setNewSquadMembers('');
      loadSquads();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCreating(false);
    }
  };

  const openChat = (squad) => {
    setSelectedSquad(squad);
    if (unsubscribe) unsubscribe();
    unsubscribe = subscribeToSquadMessages(squad.id, (msgs) => {
      setMessages(msgs);
    });
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    try {
      await sendSquadMessage(selectedSquad.id, user.uid, messageText);
      setMessageText('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSending(false);
    }
  };

  if (selectedSquad) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
            <TouchableOpacity onPress={() => { setSelectedSquad(null); if (unsubscribe) unsubscribe(); }} style={{ marginRight: 16 }}>
              <Ionicons name="arrow-back" size={24} color={colors.lavender} />
            </TouchableOpacity>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold', fontFamily: 'FiraCode-Regular' }}>{selectedSquad.name}</Text>
          </View>
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <View style={{ alignSelf: item.userId === user.uid ? 'flex-end' : 'flex-start', backgroundColor: item.userId === user.uid ? colors.primary : colors.card, margin: 8, padding: 10, borderRadius: 12, maxWidth: '80%' }}>
                <Text style={{ color: colors.text }}>{item.text}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>{new Date(item.createdAt?.toDate()).toLocaleTimeString()}</Text>
              </View>
            )}
            keyExtractor={item => item.id}
          />
          <View style={{ flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TextInput
              style={{ flex: 1, backgroundColor: colors.card, borderRadius: 20, padding: 10, color: colors.text }}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
            />
            <TouchableOpacity onPress={sendMessage} disabled={sending} style={{ marginLeft: 8, justifyContent: 'center' }}>
              <Ionicons name="send" size={24} color={colors.lavender} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.background, '#0A0A14']} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', fontFamily: 'FiraCode-Regular' }}>Squads</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle" size={32} color={colors.lavender} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.lavender} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={squads}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => openChat(item)} style={{ backgroundColor: colors.card, margin: 8, padding: 12, borderRadius: 12 }}>
                <Text style={{ color: colors.text, fontSize: 18 }}>{item.name}</Text>
                <Text style={{ color: colors.textSecondary, marginTop: 4 }}>{item.lastMessage || 'No messages yet'}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
          />
        )}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 12, width: '80%' }}>
              <Text style={{ color: colors.text, fontSize: 20, marginBottom: 16 }}>Create Squad</Text>
              <TextInput style={{ backgroundColor: colors.background, borderRadius: 8, padding: 10, color: colors.text, marginBottom: 12 }} placeholder="Squad Name" placeholderTextColor={colors.textSecondary} value={newSquadName} onChangeText={setNewSquadName} />
              <TextInput style={{ backgroundColor: colors.background, borderRadius: 8, padding: 10, color: colors.text, marginBottom: 20 }} placeholder="Member IDs (comma separated, e.g., user1,user2)" placeholderTextColor={colors.textSecondary} value={newSquadMembers} onChangeText={setNewSquadMembers} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                  <Text style={{ color: colors.lavender }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateSquad} disabled={creating} style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}>
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

export default SquadsScreen;
