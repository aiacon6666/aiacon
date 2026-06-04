import React, { useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import VidsScreen from '../screens/VidsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ConversationsScreen from '../screens/ConversationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const initialLayout = { width: Dimensions.get('window').width };

const renderScene = SceneMap({
  home: HomeScreen,
  vids: VidsScreen,
  discover: DiscoverScreen,
  inbox: ConversationsScreen,
  vault: ProfileScreen,
});

const MainTabs = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Home', icon: 'home-outline' },
    { key: 'vids', title: 'Vids', icon: 'videocam-outline' },
    { key: 'discover', title: 'Discover', icon: 'compass-outline' },
    { key: 'inbox', title: 'Inbox', icon: 'chatbubbles-outline' },
    { key: 'vault', title: 'Vault', icon: 'person-outline' },
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      renderIcon={({ route, focused }) => (
        <Ionicons name={route.icon} size={24} color={focused ? '#5B4BFF' : '#888'} />
      )}
      renderLabel={({ route, focused }) => (
        <Text style={{ color: focused ? '#5B4BFF' : '#888', fontSize: 12, marginTop: 4 }}>
          {route.title}
        </Text>
      )}
      style={{ backgroundColor: '#0A0A14', borderTopWidth: 1, borderTopColor: '#333' }}
      indicatorStyle={{ backgroundColor: '#5B4BFF' }}
      activeColor="#5B4BFF"
      inactiveColor="#888"
      pressOpacity={0.8}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      swipeEnabled={true}
      animationEnabled={true}
    />
  );
};

export default MainTabs;
