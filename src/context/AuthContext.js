import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          // Try cache first
          const cached = await AsyncStorage.getItem(`userData_${firebaseUser.uid}`);
          if (cached) setUserData(JSON.parse(cached));
          // Fetch fresh from Firestore
          const db = getFirestore();
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            await AsyncStorage.setItem(`userData_${firebaseUser.uid}`, JSON.stringify(data));
          }
        } catch (e) { console.warn(e); }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const updateUserData = async (data) => {
    setUserData(data);
    if (user) await AsyncStorage.setItem(`userData_${user.uid}`, JSON.stringify(data));
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
