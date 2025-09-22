
import admin from 'firebase-admin';

// This function initializes Firebase Admin and returns the firestore instance.
// It's designed to be safely called multiple times.
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  // Strengthened check: ensure the variable is a non-empty string.
  if (!serviceAccountString || serviceAccountString.trim() === '') {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set or is empty. Firebase Admin SDK will not be initialized. This is expected during build, but the app will not function correctly without it at runtime.'
    );
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return admin.firestore();
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw new Error('Firebase Admin SDK initialization failed. Please check your service account credentials.');
  }
}

// Initialize and export firestore.
// Any file importing 'firestore' from here will get the initialized instance.
export const firestore = initializeFirebaseAdmin();
