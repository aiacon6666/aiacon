import AvatarCreator from './src/components/AvatarCreator';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { InteractionManager, LogBox } from 'react-native';

import LoginScreen from './src/screens/auth/LoginScreen';
import SignupMethodScreen from './src/screens/auth/SignupMethodScreen';
import EmailSignupScreen from './src/screens/auth/EmailSignupScreen';
import UsernameScreen from './src/screens/auth/UsernameScreen';
import FullNameScreen from './src/screens/auth/FullNameScreen';
import DateOfBirthScreen from './src/screens/auth/DateOfBirthScreen';
import GenderScreen from './src/screens/auth/GenderScreen';
import PersonaScreen from './src/screens/auth/PersonaScreen';
import ProfilePictureScreen from './src/screens/auth/ProfilePictureScreen';
import CreateStory from "./src/screens/CreateStory";
import StoryViewer from "./src/screens/StoryViewer";
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import MainTabs from './src/navigation/MainTabs';

SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs(['AsyncStorage has been extracted']);

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, userData, loading } = useAuth();
  const [initialRoute, setInitialRoute] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    InteractionManager.runAfterInteractions(() => {
      if (!user) setInitialRoute('Login');
      else {
        const onboardingCompleted = userData?.onboardingCompleted;
        setInitialRoute(onboardingCompleted ? 'MainTabs' : 'Onboarding');
      }
      setIsReady(true);
      SplashScreen.hideAsync();
    });
  }, [loading, user, userData]);

  if (!isReady) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupMethod" component={SignupMethodScreen} />
      <Stack.Screen name="EmailSignup" component={EmailSignupScreen} />
      <Stack.Screen name="UsernameSetup" component={UsernameScreen} />
      <Stack.Screen name="FullName" component={FullNameScreen} />
      <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="Persona" component={PersonaScreen} />
      <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} />
        <Stack.Screen name="AuraStore" component={AuraStore} />
      <Stack.Screen name="AvatarCreator" component={AvatarCreator} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="CreateStory" component={CreateStory} />
        <Stack.Screen name="StoryViewer" component={StoryViewer} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="NewConversation" component={NewConversationScreen} />
        <Stack.Screen name="CommunityFeed" component={CommunityFeedScreen} />
        <Stack.Screen name="Squads" component={SquadsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'FiraCode-Regular': require('./assets/fonts/FiraCode-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
