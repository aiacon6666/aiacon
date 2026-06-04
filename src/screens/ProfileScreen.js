import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const SECTION_TABS = ['Broadcasts', 'About Archive', 'Saved', 'Liked', 'Aura History'];

function AuraDisplay({ aura }) {
  const display = aura >= 999999 ? '∞' : aura?.toLocaleString() || '0';
  return (
    <View style={styles.auraBox}>
      <Text style={styles.auraLabel}>✨ Aura</Text>
      <Text style={styles.auraValue}>{display}</Text>
    </View>
  );
}

function ProfileScreen({ navigation }) {
  const { profile, logout } = useAuth();
  const [activeSection, setActiveSection] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
    ]);
  }

  if (!profile) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.secondary, Colors.primary, Colors.background]} style={styles.banner} />

        <View style={styles.profileSection}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: profile.avatar || `https://ui-avatars.com/api/?name=${profile.username || 'U'}&background=0047AB&color=fff` }}
              style={styles.avatar}
            />
            <View style={styles.statsRow}>
              {[
                { label: 'Posts', value: profile.postsCount || 0 },
                { label: 'Followers', value: profile.followers?.length || 0 },
                { label: 'Following', value: profile.following?.length || 0 },
              ].map((stat, i) => (
                <View key={i} style={styles.statItem}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.displayName}>{profile.displayName || profile.username}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          {profile.link ? <Text style={styles.link}>{profile.link}</Text> : null}

          <AuraDisplay aura={profile.aura} />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.storeBtn} onPress={() => navigation.navigate('AuraStore')}>
              <Text style={styles.storeBtnText}>✨ Aura Store</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsVisible(true)}>
              <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectionTabsScroll}>
          {SECTION_TABS.map((tab, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.sectionTab, activeSection === i && styles.sectionTabActive]}
              onPress={() => setActiveSection(i)}
            >
              <Text style={[styles.sectionTabText, activeSection === i && { color: Colors.text }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionContent}>
          <Text style={styles.placeholderText}>{SECTION_TABS[activeSection]} content will appear here.</Text>
        </View>
      </ScrollView>

      <Modal visible={settingsVisible} animationType="slide" onRequestClose={() => setSettingsVisible(false)}>
        <SafeAreaView style={styles.settingsModal}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Settings</Text>
            <TouchableOpacity onPress={() => setSettingsVisible(false)}>
              <Ionicons name="close" size={26} color={Colors.text} />
            </TouchableOpacity>
          </View>
          {[
            { label: 'Edit Profile', icon: 'person-outline', action: () => { setSettingsVisible(false); navigation.navigate('EditProfile'); } },
            { label: 'Notifications', icon: 'notifications-outline', action: () => setSettingsVisible(false) },
            { label: 'Privacy', icon: 'lock-closed-outline', action: () => setSettingsVisible(false) },
            { label: 'Data Export', icon: 'download-outline', action: () => { setSettingsVisible(false); Alert.alert('Export', 'Feature coming soon.'); } },
            { label: 'Logout', icon: 'log-out-outline', action: () => { setSettingsVisible(false); handleLogout(); } },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.settingsItem} onPress={item.action}>
              <Ionicons name={item.icon} size={22} color={i === 4 ? Colors.error : Colors.textSecondary} />
              <Text style={[styles.settingsItemText, i === 4 && { color: Colors.error }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.border} />
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontFamily: 'FiraCode-Regular' },
  banner: { height: 110 },
  profileSection: { padding: 16, marginTop: -20 },
  avatarRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: Colors.background, marginRight: 16 },
  statsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  statItem: { alignItems: 'center' },
  statValue: { color: Colors.text, fontSize: 18, fontWeight: '800', fontFamily: 'FiraCode-Regular' },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2, fontFamily: 'FiraCode-Regular' },
  displayName: { color: Colors.text, fontSize: 20, fontWeight: '800', marginBottom: 2, fontFamily: 'FiraCode-Regular' },
  username: { color: Colors.textSecondary, fontSize: 14, marginBottom: 6, fontFamily: 'FiraCode-Regular' },
  bio: { color: Colors.text, fontSize: 13, lineHeight: 18, marginBottom: 4, fontFamily: 'FiraCode-Regular' },
  link: { color: Colors.accent, fontSize: 13, marginBottom: 12, fontFamily: 'FiraCode-Regular' },
  auraBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.accent, alignSelf: 'flex-start', marginBottom: 14 },
  auraLabel: { color: Colors.textSecondary, fontSize: 13, marginRight: 8, fontFamily: 'FiraCode-Regular' },
  auraValue: { color: Colors.accent, fontSize: 18, fontWeight: '800', fontFamily: 'FiraCode-Regular' },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginRight: 8 },
  editBtnText: { color: Colors.text, fontWeight: '600', fontSize: 13, fontFamily: 'FiraCode-Regular' },
  storeBtn: { flex: 1, backgroundColor: Colors.secondary, borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginRight: 8 },
  storeBtnText: { color: Colors.text, fontWeight: '600', fontSize: 13, fontFamily: 'FiraCode-Regular' },
  settingsBtn: { padding: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 10 },
  sectionTabsScroll: { marginVertical: 10 },
  sectionTab: { paddingHorizontal: 16, paddingVertical: 8, marginLeft: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  sectionTabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sectionTabText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', fontFamily: 'FiraCode-Regular' },
  sectionContent: { minHeight: 200, alignItems: 'center', paddingTop: 30 },
  placeholderText: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'FiraCode-Regular' },
  settingsModal: { flex: 1, backgroundColor: Colors.background },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsTitle: { color: Colors.text, fontSize: 20, fontWeight: '700', fontFamily: 'FiraCode-Regular' },
  settingsItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsItemText: { flex: 1, color: Colors.text, fontSize: 15, marginLeft: 14, fontFamily: 'FiraCode-Regular' },
});

export default ProfileScreen;
