import { db } from '../../services/backend';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

export const searchUsers = async (queryText) => {
  const lowerQuery = queryText.toLowerCase();
  const usersRef = collection(db, 'userSearch');
  const q = query(usersRef, where('usernameLower', '>=', lowerQuery), where('usernameLower', '<=', lowerQuery + '\uf8ff'), limit(20));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const searchPosts = async (queryText) => {
  // Using Algolia or similar would be better, but for Firestore we use array-contains
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('tags', 'array-contains', queryText.toLowerCase()), limit(20), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
