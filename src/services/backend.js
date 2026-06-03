import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification, updateProfile, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs, limit, runTransaction } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Real Firebase config from your google-services.json
const firebaseConfig = {
  apiKey: "AIzaSyDHsZfuqWcd3rd85RIfxepJ9kiB6HWxko4",
  authDomain: "aiacon-f3655.firebaseapp.com",
  projectId: "aiacon-f3655",
  storageBucket: "aiacon-f3655.firebasestorage.app",
  messagingSenderId: "593208551399",
  appId: "1:593208551399:android:c30c4f1280881b9fc73f42"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ========== AUTH ==========
export const loginWithEmail = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const loginWithUsername = async (username, password) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error('Username not found');
  const email = snap.docs[0].data().email;
  return loginWithEmail(email, password);
};

export const signUpWithEmail = async (email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  return cred.user;
};

export const logout = async () => {
  await signOut(auth);
  await AsyncStorage.multiRemove(['onboardingCompleted', 'cachedUser']);
};

// ========== USERNAME SYSTEM ==========
export const reserveUsername = async (userId, username) => {
  const usernameDoc = doc(db, 'usernames', username);
  const userDoc = doc(db, 'users', userId);
  try {
    await runTransaction(db, async (transaction) => {
      const usernameSnap = await transaction.get(usernameDoc);
      if (usernameSnap.exists()) throw new Error('Username already taken');
      transaction.set(usernameDoc, { uid: userId, createdAt: new Date() });
      transaction.update(userDoc, { username });
    });
    return true;
  } catch (e) { throw e; }
};

export const isUsernameTaken = async (username) => {
  const snap = await getDoc(doc(db, 'usernames', username));
  return snap.exists();
};

// ========== USER PROFILE ==========
export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, 'users', uid), { ...data, createdAt: new Date(), updatedAt: new Date() });
};

export const updateUserProfile = async (uid, updates) => {
  await updateDoc(doc(db, 'users', uid), { ...updates, updatedAt: new Date() });
  await AsyncStorage.removeItem(`userData_${uid}`);
};

export const uploadProfilePicture = async (uid, uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `profilePictures/${uid}.jpg`);
  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);
  await updateUserProfile(uid, { profilePicture: url });
  return url;
};

// ========== ONBOARDING ==========
export const completeOnboarding = async (uid) => {
  await updateDoc(doc(db, 'users', uid), { onboardingCompleted: true });
  await AsyncStorage.setItem('onboardingCompleted', 'true');
};

// ========== HELPER: CHECK ACCOUNT LIMITS ==========
export const countAccountsByEmail = async (email) => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  return snap.size;
};

// ========== PHONE AUTH (basic) ==========
export const sendPhoneOTP = async (phoneNumber, recaptchaVerifier) => {
  const provider = new PhoneAuthProvider(auth);
  const verificationId = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
  return verificationId;
};

export const signInWithPhoneOTP = async (verificationId, code) => {
  const credential = PhoneAuthProvider.credential(verificationId, code);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
};

// Export instances
export { auth, db, storage };
