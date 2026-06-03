import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ========== FEED GENERATION (fanout on write) ==========
export const onPostCreated = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const post = snap.data();
    const { userId, communityId } = post;
    let followerIds: string[] = [];

    if (communityId) {
      // Get community members
      const membersSnap = await db.collection('communities').doc(communityId).collection('members').get();
      followerIds = membersSnap.docs.map(d => d.id);
    } else {
      // Get user's followers (store in subcollection)
      const followersSnap = await db.collection('users').doc(userId).collection('followers').get();
      followerIds = followersSnap.docs.map(d => d.id);
    }

    // Fanout: write post reference to each follower's feed
    const batch = db.batch();
    const feedRef = db.collection('feeds');
    for (const followerId of followerIds) {
      const feedDoc = feedRef.doc(`${followerId}_${context.params.postId}`);
      batch.set(feedDoc, {
        userId: followerId,
        postId: context.params.postId,
        authorId: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        type: communityId ? 'community' : 'user',
      });
    }
    await batch.commit();
    return null;
  });

// ========== NOTIFICATIONS ==========
export const onFollowCreated = functions.firestore
  .document('users/{userId}/followers/{followerId}')
  .onCreate(async (snap, context) => {
    const { userId, followerId } = context.params;
    await db.collection('notifications').add({
      userId: userId,
      type: 'follow',
      actorId: followerId,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return null;
  });

export const onLikeCreated = functions.firestore
  .document('posts/{postId}/likes/{userId}')
  .onCreate(async (snap, context) => {
    const postSnap = await db.collection('posts').doc(context.params.postId).get();
    const post = postSnap.data();
    if (post.userId !== context.params.userId) {
      await db.collection('notifications').add({
        userId: post.userId,
        type: 'like',
        actorId: context.params.userId,
        postId: context.params.postId,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    return null;
  });

// ========== USER SEARCH (indexing) ==========
export const onUserCreate = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const user = snap.data();
    await db.collection('userSearch').doc(context.params.userId).set({
      username: user.username,
      usernameLower: user.username.toLowerCase(),
      fullName: user.fullName,
      fullNameLower: user.fullName.toLowerCase(),
      profilePicture: user.profilePicture,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return null;
  });

// ========== TRENDING SCORES (update on likes/comments) ==========
export const updateTrendingScore = functions.firestore
  .document('posts/{postId}/likes/{likeId}')
  .onWrite(async (change, context) => {
    const postId = context.params.postId;
    const postRef = db.collection('posts').doc(postId);
    const postSnap = await postRef.get();
    if (!postSnap.exists) return;
    const likesCount = (await postRef.collection('likes').count().get()).data().count;
    const commentsCount = (await postRef.collection('comments').count().get()).data().count;
    const trendingScore = (likesCount * 1) + (commentsCount * 2);
    await postRef.update({ trendingScore, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return null;
  });
