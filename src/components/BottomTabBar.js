import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const tabs = [
  { key: 'Home', icon: 'home', label: 'Home' },
  { key: 'Vids', icon: 'videocam', label: 'Vids' },
  { key: 'Discover', icon: 'search', label: 'Discover' },
  { key: 'Conversations', icon: 'chatbubble-ellipses', label: 'Chats' },
  { key: 'Profile', icon: 'person', label: 'You' },
];

export default function BottomTabBar({ activeTab, onTabPress }) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
        >
          <Ionicons
            name={activeTab === tab.key ? tab.icon : tab.icon + '-outline'}
            size={24}
            color={activeTab === tab.key ? (tab.key === 'Discover' ? '#00FFFF' : '#FFFFFF') : '#888888'}
          />
          <Text style={[styles.label, activeTab === tab.key && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#000000',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#1A1A1A',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#888888',
    fontSize: 10,
    marginTop: 2,
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
