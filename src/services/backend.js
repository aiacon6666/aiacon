import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, updateDoc, arrayUnion, arrayRemove, getDoc, increment, writeBatch, deleteDoc } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification, updateProfile, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all Firebase keys from central config
import {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId
} from '../config/keys';

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId
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
// Add aura field to user creation
export const initializeUserAura = async (userId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { aura: 0 });
};
// ========== FEED & FOLLOW SYSTEM ==========

// Fetch posts with pagination
export const fetchPosts = async (lastDoc = null, userIds = null, pageSize = 5) => {
  let postsQuery;
  if (userIds && userIds.length > 0) {
    // For following feed: posts from specific users
    postsQuery = query(
      collection(db, 'posts'),
      where('userId', 'in', userIds),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  } else {
    // For you feed: all posts
    postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  if (lastDoc) {
    postsQuery = query(postsQuery, startAfter(lastDoc));
  }
  const snapshot = await getDocs(postsQuery);
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  return { posts, lastVisible };
};

// Follow a user
export const followUser = async (targetUserId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not logged in');
  const currentUserRef = doc(db, 'users', currentUser.uid);
  const targetUserRef = doc(db, 'users', targetUserId);
  await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
  await updateDoc(targetUserRef, { followers: arrayUnion(currentUser.uid) });
  // Optional: send notification
};

// Unfollow a user
export const unfollowUser = async (targetUserId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not logged in');
  const currentUserRef = doc(db, 'users', currentUser.uid);
  const targetUserRef = doc(db, 'users', targetUserId);
  await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
  await updateDoc(targetUserRef, { followers: arrayRemove(currentUser.uid) });
};

// Get list of users that the current user follows
export const getFollowingList = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];
  const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
  return userDoc.data()?.following || [];
};
// Ensure user document has following/followers arrays on creation
export const initializeUserRelations = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;
  const data = userSnap.data();
  if (!data.following) await updateDoc(userRef, { following: [] });
  if (!data.followers) await updateDoc(userRef, { followers: [] });
};
// ========== AURA ECONOMY ==========

// Get user aura balance
export const getUserAura = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.data()?.aura || 0;
};

// Add or subtract aura (respects limits)
export const adjustAura = async (userId, amount) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  let currentAura = userSnap.data()?.aura || 0;
  let newAura = currentAura + amount;
  // Apply limits: min -99, max 999999 (display as ∞ later)
  if (newAura > 999999) newAura = 999999;
  if (newAura < -99) newAura = -99;
  await updateDoc(userRef, { aura: newAura });
  return newAura;
};

// Record aura transaction (for history)
export const addAuraTransaction = async (userId, type, amount, referenceId) => {
  const userRef = doc(db, 'users', userId);
  const transactions = userSnap.data()?.auraTransactions || [];
  transactions.push({
    id: Date.now().toString(),
    type, // 'earn_like', 'earn_repost', 'earn_comment', 'gift_sent', 'gift_received', 'spend_store'
    amount,
    referenceId,
    createdAt: new Date(),
  });
  await updateDoc(userRef, { auraTransactions: transactions });
};

// Unlock an item for user
export const unlockAvatarItem = async (userId, itemId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const unlockedItems = userSnap.data()?.unlockedItems || [];
  if (!unlockedItems.includes(itemId)) {
    await updateDoc(userRef, { unlockedItems: [...unlockedItems, itemId] });
  }
};
// ========== COMMUNITIES ==========

// Create a new community
export const createCommunity = async (name, description, isPublic = true, createdBy) => {
  const communityRef = await addDoc(collection(db, 'communities'), {
    name,
    description,
    isPublic,
    createdBy,
    createdAt: new Date(),
    memberCount: 1,
    postCount: 0,
    members: [createdBy],
  });
  // Add the creator as a member in a subcollection for easier queries
  await setDoc(doc(db, 'communities', communityRef.id, 'members', createdBy), { joinedAt: new Date() });
  return communityRef.id;
};

// Get public communities
export const getPublicCommunities = async () => {
  const q = query(collection(db, 'communities'), where('isPublic', '==', true), orderBy('createdAt', 'desc'), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Join a community
export const joinCommunity = async (communityId, userId) => {
  const communityRef = doc(db, 'communities', communityId);
  await updateDoc(communityRef, { members: arrayUnion(userId), memberCount: increment(1) });
  await setDoc(doc(db, 'communities', communityId, 'members', userId), { joinedAt: new Date() });
};

// Leave a community
export const leaveCommunity = async (communityId, userId) => {
  const communityRef = doc(db, 'communities', communityId);
  await updateDoc(communityRef, { members: arrayRemove(userId), memberCount: increment(-1) });
  await deleteDoc(doc(db, 'communities', communityId, 'members', userId));
};

// Post to a community
export const postToCommunity = async (communityId, userId, text, mediaUrl = null) => {
  const postRef = await addDoc(collection(db, 'communities', communityId, 'posts'), {
    userId,
    text,
    mediaUrl,
    createdAt: new Date(),
    likeCount: 0,
    commentCount: 0,
  });
  await updateDoc(doc(db, 'communities', communityId), { postCount: increment(1) });
  return postRef.id;
};

// Get community posts
export const getCommunityPosts = async (communityId, lastDoc = null, pageSize = 10) => {
  let q = query(collection(db, 'communities', communityId, 'posts'), orderBy('createdAt', 'desc'), limit(pageSize));
  if (lastDoc) q = query(q, startAfter(lastDoc));
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  return { posts, lastVisible };
};

// ========== SQUADS (Private Group Chats) ==========
// Create a squad (private group)
export const createSquad = async (name, participants, createdBy) => {
  const squadRef = await addDoc(collection(db, 'squads'), {
    name,
    participants: [createdBy, ...participants],
    createdBy,
    createdAt: new Date(),
    lastMessage: null,
    lastMessageAt: null,
  });
  // Add participants to a subcollection for easy querying
  for (const uid of [createdBy, ...participants]) {
    await setDoc(doc(db, 'squads', squadRef.id, 'members', uid), { joinedAt: new Date() });
  }
  return squadRef.id;
};

// Send message to squad
export const sendSquadMessage = async (squadId, userId, text, mediaUrl = null, voiceUrl = null) => {
  const messageRef = await addDoc(collection(db, 'squads', squadId, 'messages'), {
    userId,
    text,
    mediaUrl,
    voiceUrl,
    createdAt: new Date(),
    readBy: [userId],
  });
  await updateDoc(doc(db, 'squads', squadId), { lastMessage: text, lastMessageAt: new Date() });
  return messageRef.id;
};

// Get squad messages (realtime listener)
export const subscribeToSquadMessages = (squadId, callback) => {
  const q = query(collection(db, 'squads', squadId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// Get user's squads
export const getUserSquads = async (userId) => {
  const q = query(collection(db, 'squads'), where('participants', 'array-contains', userId), orderBy('lastMessageAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// ========== DIRECT MESSAGING (1-ON-1) ==========

// Get or create a conversation between two users
export const getOrCreateConversation = async (userId1, userId2) => {
  const conversationsRef = collection(db, 'conversations');
  const q1 = query(conversationsRef, where('participants', 'array-contains', userId1));
  const snapshot = await getDocs(q1);
  const existing = snapshot.docs.find(doc => doc.data().participants.includes(userId2));
  if (existing) return existing.id;
  // Create new conversation
  const newConv = await addDoc(conversationsRef, {
    participants: [userId1, userId2],
    createdAt: new Date(),
    lastMessage: null,
    lastMessageAt: null,
    lastMessageSenderId: null,
  });
  return newConv.id;
};

// Send a message (text, image, voice)
export const sendMessage = async (conversationId, senderId, text, mediaUrl = null, voiceUrl = null) => {
  const messageRef = await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId,
    text,
    mediaUrl,
    voiceUrl,
    createdAt: new Date(),
    read: false,
  });
  // Update conversation metadata
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, {
    lastMessage: text,
    lastMessageAt: new Date(),
    lastMessageSenderId: senderId,
  });
  return messageRef.id;
};

// Get user's conversations (inbox)
export const getUserConversations = async (userId) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const conversations = [];
  for (const convDoc of snapshot.docs) {
    const conv = { id: convDoc.id, ...convDoc.data() };
    const otherUserId = conv.participants.find(uid => uid !== userId);
    const userDoc = await getDoc(doc(db, 'users', otherUserId));
    conv.otherUser = userDoc.exists() ? { id: otherUserId, ...userDoc.data() } : { id: otherUserId, username: 'Unknown' };
    conversations.push(conv);
  }
  return conversations;
};

// Subscribe to messages in a conversation (real-time)
export const subscribeToMessages = (conversationId, callback) => {
  const q = query(collection(db, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId, userId) => {
  const q = query(collection(db, 'conversations', conversationId, 'messages'), where('read', '==', false));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    if (doc.data().senderId !== userId) {
      batch.update(doc.ref, { read: true });
    }
  });
  await batch.commit();
};

// ========== GOOGLE SIGN-IN (OAuth) ==========
import { googleAndroidClientId, googleWebClientId } from '../config/keys';

// For Android APK
export const getGoogleAndroidClientId = () => googleAndroidClientId;
// For development (Expo Go) – web client ID
export const getGoogleWebClientId = () => googleWebClientId;
