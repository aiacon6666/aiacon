import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app, db } from '../services/backend';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  async function loadProfile(uid) {
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setProfile(snap.data());
      }
    } catch (e) {
      console.log('loadProfile error', e);
    } finally {
      setLoading(false);
    }
  }

  async function loginEmail(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function loginGuest() {
    const cred = await signInAnonymously(auth);
    const ref = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: cred.user.uid,
        username: 'guest_' + cred.user.uid.slice(0, 6),
        displayName: 'Guest',
        isGuest: true,
        aura: 0,
        followers: [],
        following: [],
        createdAt: serverTimestamp(),
      });
    }
    return cred.user;
  }

  async function signupEmail(email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  async function saveProfile(uid, data) {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, data, { merge: true });
    setProfile((prev) => ({ ...prev, ...data }));
  }

  async function logout() {
    await signOut(auth);
    setProfile(null);
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.uid);
  }

  const value = {
    user,
    profile,
    loading,
    loginEmail,
    loginGuest,
    signupEmail,
    saveProfile,
    logout,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
