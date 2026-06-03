import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupMethodScreen from './src/screens/auth/SignupMethodScreen';
import EmailSignupScreen from './src/screens/auth/EmailSignupScreen';
import UsernameScreen from './src/screens/auth/UsernameScreen';
import FullNameScreen from './src/screens/auth/FullNameScreen';
import DateOfBirthScreen from './src/screens/auth/DateOfBirthScreen';
import GenderScreen from './src/screens/auth/GenderScreen';
import PersonaScreen from './src/screens/auth/PersonaScreen';
import ProfilePictureScreen from './src/screens/auth/ProfilePictureScreen';
import OnboardingScreen from './src/screens/onboarding/OnboardingScreen';
import MainTabs from './src/navigation/MainTabs'; // adjust if your main tabs component is different

const Stack = createNativeStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setInitialRoute('Login');
        setLoading(false);
        return;
      }
      // Check onboarding completion in Firestore
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const onboardingCompleted = userDoc.data()?.onboardingCompleted || false;
        if (!onboardingCompleted) {
          setInitialRoute('Onboarding');
        } else {
          setInitialRoute('MainTabs');
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setInitialRoute('MainTabs');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignupMethod" component={SignupMethodScreen} />
        <Stack.Screen name="EmailSignup" component={EmailSignupScreen} />
        <Stack.Screen name="UsernameSetup" component={UsernameScreen} />
        <Stack.Screen name="FullName" component={FullNameScreen} />
        <Stack.Screen name="DateOfBirth" component={DateOfBirthScreen} />
        <Stack.Screen name="Gender" component={GenderScreen} />
        <Stack.Screen name="Persona" component={PersonaScreen} />
        <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
