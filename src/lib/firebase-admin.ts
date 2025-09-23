
import admin from 'firebase-admin';

// This function initializes Firebase Admin and returns the firestore instance.
// It's designed to be safely called multiple times.
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  // Strengthened check: ensure the variable is a non-empty string that looks like a JSON object.
  if (!serviceAccountString || !serviceAccountString.startsWith('{')) {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON object. Firebase Admin SDK will not be initialized. This is expected during build, but the app will not function correctly without it at runtime.'
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
    // Throwing an error here can be helpful for debugging but might crash server startup.
    // Consider whether to throw or just return null based on your deployment strategy.
    return null; 
  }
}

// Initialize and export firestore.
// Any file importing 'firestore' from here will get the initialized instance or null.
export const firestore = initializeFirebaseAdmin();
