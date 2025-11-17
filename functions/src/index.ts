import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import fetch from 'node-fetch';

admin.initializeApp();

// ----------------------
// Expo Push Notification
// ----------------------
interface ExpoPushMessage {
  to: string;
  sound: string;
  title: string;
  body: string;
  data: Record<string, any>;
}

export const sendNewsNotification = functions.firestore
  .document('newsList/{newsId}')
  .onCreate(async (snap, context) => {
    const newNews = snap.data();

    const tokensSnapshot = await admin
      .firestore()
      .collection('pushTokens')
      .get();
    const messages: ExpoPushMessage[] = [];

    tokensSnapshot.forEach((doc) => {
      const token = doc.data().token;
      if (token) {
        messages.push({
          to: token,
          sound: 'default',
          title: newNews.title || 'New News!',
          body: newNews.body || '',
          data: { newsId: context.params.newsId },
        });
      }
    });

    const chunks = [];
    while (messages.length) chunks.push(messages.splice(0, 100));

    for (const chunk of chunks) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
    }

    return null;
  });

// ----------------------
// Clerk User Deletion
// ----------------------
const EXPO_CLERK_SECRET_KEY = functions.config().clerk.secret_key;

/**
 * HTTPS callable function
 * Frontend calls this function when a user requests account deletion
 */
export const deleteClerkUser = functions.https.onCall(async (data, context) => {
  const { userId } = data;

  if (!userId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID is required.'
    );
  }

  try {
    const response = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${EXPO_CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new functions.https.HttpsError(
        'internal',
        `Failed to delete Clerk user: ${response.statusText} - ${errorBody}`
      );
    }

    // Optional: also clean up Firestore user data
    await admin.firestore().collection('users').doc(userId).delete();

    return {
      success: true,
      message: 'User deleted successfully from Clerk and Firestore.',
    };
  } catch (error: any) {
    console.error('Error deleting Clerk user:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
