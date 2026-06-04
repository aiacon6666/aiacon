import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import Colors from './src/theme/colors';

// Screens
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupMethodScreen from './src/screens/auth/SignupMethodScreen';
import EmailSignupScreen from './src/screens/auth/EmailSignupScreen';
import UsernameScreen from './src/screens/auth/UsernameScreen';
import FullNameScreen from './src/screens/auth/FullNameScreen';
import DateOfBirthScreen from './src/screens/auth/DateOfBirthScreen';
import GenderScreen from './src/screens/auth/GenderScreen';
import PersonaScreen from './src/screens/auth/PersonaScreen';
import ProfilePictureScreen from './src/screens/auth/ProfilePictureScreen';
import MainTabs from './src/navigation/MainTabs';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!user ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Auth" component={LoginScreen} />
          <Stack.Screen name="SignupMethod" component={SignupMethodScreen} />
          <Stack.Screen name="EmailSignup" component={EmailSignupScreen} />
          <Stack.Screen name="Username" component={UsernameScreen} />
          <Stack.Screen name="FullName" component={FullNameScreen} />
          <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
          <Stack.Screen name="Gender" component={GenderScreen} />
          <Stack.Screen name="Persona" component={PersonaScreen} />
          <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'FiraCode-Regular': require('./assets/fonts/FiraCode-Regular.ttf'),
        });
      } catch (e) {
        console.warn('Font load warning:', e);
      } finally {
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer
            theme={{
              dark: true,
              colors: {
                primary: Colors.primary,
                background: Colors.background,
                card: Colors.card,
                text: Colors.text,
                border: Colors.border,
                notification: Colors.accent,
              },
            }}
          >
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
