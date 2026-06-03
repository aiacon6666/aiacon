import { db, auth } from '../../services/backend';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

export const fetchActiveStories = async (userId) => {
  const now = new Date();
  const storiesRef = collection(db, 'stories');
  const q = query(storiesRef, where('userId', '==', userId), where('expiresAt', '>', now));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createStory = async (mediaUrl, type = 'image') => {
  const user = auth.currentUser;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await addDoc(collection(db, 'stories'), {
    userId: user.uid,
    mediaUrl,
    type,
    createdAt: new Date(),
    expiresAt,
  });
};

// Cleanup expired stories (Cloud Function should do this)
