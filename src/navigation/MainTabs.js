import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import VidsScreen from '../screens/VidsScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import InboxScreen from '../screens/InboxScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import NewConversationScreen from '../screens/NewConversationScreen';
import CommunityFeedScreen from '../screens/CommunityFeedScreen';
import SquadsScreen from '../screens/SquadsScreen';
import AuraStore from '../screens/AuraStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: ['home', 'home-outline'],
  Vids: ['play-circle', 'play-circle-outline'],
  Discover: ['sparkles', 'sparkles-outline'],
  Inbox: ['chatbubbles', 'chatbubbles-outline'],
  Vault: ['person', 'person-outline'],
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? icons[0] : icons[1]} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', fontFamily: 'FiraCode-Regular' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Vids" component={VidsScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Vault" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={HomeTabs} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="NewConversation" component={NewConversationScreen} />
      <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
      <Stack.Screen name="Squads" component={SquadsScreen} />
      <Stack.Screen name="AuraStore" component={AuraStore} />
    </Stack.Navigator>
  );
}

export default MainTabs;
