import { db, auth } from '../../services/backend';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';

export const sendMessage = async (conversationId, text, mediaUrl = null) => {
  const user = auth.currentUser;
  const message = {
    conversationId,
    senderId: user.uid,
    text,
    mediaUrl,
    createdAt: new Date(),
    read: false,
  };
  const messageRef = await addDoc(collection(db, 'messages'), message);
  // Update conversation last message
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, { lastMessage: text, lastMessageAt: new Date() });
  return messageRef;
};

export const subscribeToMessages = (conversationId, callback) => {
  const q = query(collection(db, 'messages'), where('conversationId', '==', conversationId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};

export const createConversation = async (participantIds, type = 'direct') => {
  const convRef = await addDoc(collection(db, 'conversations'), {
    participants: participantIds,
    type,
    createdAt: new Date(),
    lastMessageAt: new Date(),
  });
  return convRef.id;
};
