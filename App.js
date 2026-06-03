import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InteractionManager, Platform, LogBox } from 'react-native';

// Screens (lazy loaded)
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupMethodScreen from './src/screens/auth/SignupMethodScreen';
import EmailSignupScreen from './src/screens/auth/EmailSignupScreen';
import UsernameScreen from './src/screens/auth/UsernameScreen';
import FullNameScreen from './src/screens/auth/FullNameScreen';
import DateOfBirthScreen from './src/screens/auth/DateOfBirthScreen';
import GenderScreen from './src/screens/auth/GenderScreen';
import PersonaScreen from './src/screens/auth/PersonaScreen';
import ProfilePictureScreen from './src/screens/auth/ProfilePictureScreen';
import PhoneAuthScreen from './src/screens/auth/PhoneAuthScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import MainTabs from './src/navigation/MainTabs';

SplashScreen.preventAutoHideAsync();
LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native core']);

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, userData, loading } = useAuth();
  const [initialRoute, setInitialRoute] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    InteractionManager.runAfterInteractions(() => {
      if (!user) {
        setInitialRoute('Login');
      } else {
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
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
