import { db, auth } from '../../services/backend';
import { collection, query, where, getDocs, limit, startAfter, orderBy, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'feed_cache';
const PAGE_SIZE = 10;

export const fetchFeed = async (lastDoc = null) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not logged in');

  let feedQuery = query(
    collection(db, 'feeds'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  );
  if (lastDoc) feedQuery = query(feedQuery, startAfter(lastDoc));

  const snapshot = await getDocs(feedQuery);
  const posts = [];
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  for (const docSnap of snapshot.docs) {
    const postId = docSnap.data().postId;
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (postDoc.exists()) posts.push({ id: postDoc.id, ...postDoc.data() });
  }

  // Cache for offline
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(posts));
  return { posts, lastVisible };
};

export const getCachedFeed = async () => {
  const cached = await AsyncStorage.getItem(CACHE_KEY);
  return cached ? JSON.parse(cached) : [];
};
