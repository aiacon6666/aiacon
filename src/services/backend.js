import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, startAfter, where, updateDoc, doc, increment, arrayUnion, arrayRemove, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { FIREBASE_CONFIG } from '../config/keys';

export const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function createPost(authorId, authorName, authorAvatar, caption, mediaUrl, mediaType) {
  const ref = collection(db, 'posts');
  const docRef = await addDoc(ref, {
    authorId,
    authorName,
    authorAvatar: authorAvatar || '',
    caption,
    mediaUrl: mediaUrl || '',
    mediaType: mediaType || 'none',
    likes: [],
    reposts: [],
    thoughts: 0,
    shares: 0,
    createdAt: serverTimestamp(),
    reported: false,
  });
  return docRef.id;
}

export async function fetchPosts(lastDoc, pageSize = 10) {
  let q;
  if (lastDoc) {
    q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
  } else {
    q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(pageSize));
  }
  const snap = await getDocs(q);
  const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return { posts, lastDoc: snap.docs[snap.docs.length - 1] || null };
}

export async function fetchFollowingPosts(following, lastDoc, pageSize = 10) {
  if (!following || following.length === 0) return { posts: [], lastDoc: null };
  let q;
  if (lastDoc) {
    q = query(collection(db, 'posts'), where('authorId', 'in', following.slice(0, 10)), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
  } else {
    q = query(collection(db, 'posts'), where('authorId', 'in', following.slice(0, 10)), orderBy('createdAt', 'desc'), limit(pageSize));
  }
  const snap = await getDocs(q);
  const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return { posts, lastDoc: snap.docs[snap.docs.length - 1] || null };
}

export async function toggleLike(postId, uid) {
  const ref = doc(db, 'posts', postId);
  const snap = await getDoc(ref);
  const data = snap.data();
  const liked = data.likes && data.likes.includes(uid);
  if (liked) {
    await updateDoc(ref, { likes: arrayRemove(uid) });
    return false;
  } else {
    await updateDoc(ref, { likes: arrayUnion(uid) });
    await addAura(data.authorId, 1, 'received_like');
    return true;
  }
}

export async function repostPost(postId, uid) {
  const ref = doc(db, 'posts', postId);
  await updateDoc(ref, { reposts: arrayUnion(uid) });
  const snap = await getDoc(ref);
  await addAura(snap.data().authorId, 5, 'received_repost');
}

// ─── Stories ─────────────────────────────────────────────────────────────────

export async function createStory(authorId, authorName, authorAvatar, mediaUrl, mediaType, text, bgMusic, expiresInHours = 24) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  const docRef = await addDoc(collection(db, 'stories'), {
    authorId,
    authorName,
    authorAvatar: authorAvatar || '',
    mediaUrl: mediaUrl || '',
    mediaType: mediaType || 'image',
    text: text || '',
    bgMusic: bgMusic || '',
    expiresAt,
    viewers: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchActiveStories() {
  const now = new Date();
  const q = query(collection(db, 'stories'), where('expiresAt', '>', now), orderBy('expiresAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Aura ─────────────────────────────────────────────────────────────────────

export async function addAura(uid, amount, reason) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { aura: increment(amount) });
  await addDoc(collection(db, 'auraTransactions'), {
    uid,
    amount,
    reason,
    createdAt: serverTimestamp(),
  });
}

export async function giftAura(fromUid, toUid) {
  await addAura(fromUid, -90, 'gifted_aura');
  await addAura(toUid, 9, 'received_gift');
  await createNotification(toUid, fromUid, 'gift', 'sent you Aura!');
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export async function followUser(myUid, targetUid) {
  const myRef = doc(db, 'users', myUid);
  const targetRef = doc(db, 'users', targetUid);
  await updateDoc(myRef, { following: arrayUnion(targetUid) });
  await updateDoc(targetRef, { followers: arrayUnion(myUid) });
  await createNotification(targetUid, myUid, 'follow', 'started following you');
}

export async function unfollowUser(myUid, targetUid) {
  const myRef = doc(db, 'users', myUid);
  const targetRef = doc(db, 'users', targetUid);
  await updateDoc(myRef, { following: arrayRemove(targetUid) });
  await updateDoc(targetRef, { followers: arrayRemove(myUid) });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function createNotification(toUid, fromUid, type, message) {
  await addDoc(collection(db, 'notifications'), {
    toUid,
    fromUid,
    type,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function listenNotifications(uid, callback) {
  const q = query(collection(db, 'notifications'), where('toUid', '==', uid), orderBy('createdAt', 'desc'), limit(30));
  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(notifs);
  });
}

// ─── Communities ──────────────────────────────────────────────────────────────

export async function fetchCommunities() {
  const snap = await getDocs(collection(db, 'communities'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function joinCommunity(commId, uid) {
  await updateDoc(doc(db, 'communities', commId), { members: arrayUnion(uid) });
}

export async function leaveCommunity(commId, uid) {
  await updateDoc(doc(db, 'communities', commId), { members: arrayRemove(uid) });
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function createConversation(members) {
  const docRef = await addDoc(collection(db, 'conversations'), {
    members,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function sendMessage(convId, senderId, text, mediaUrl) {
  await addDoc(collection(db, 'conversations', convId, 'messages'), {
    senderId,
    text: text || '',
    mediaUrl: mediaUrl || '',
    read: false,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: text || '📎 Media',
    lastMessageAt: serverTimestamp(),
  });
}

export function listenMessages(convId, callback) {
  const q = query(collection(db, 'conversations', convId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}
