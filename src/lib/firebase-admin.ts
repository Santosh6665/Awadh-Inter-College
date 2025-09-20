import admin from 'firebase-admin';

// This function initializes Firebase Admin and returns the firestore instance.
// It's designed to be safely called multiple times.
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountString) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment variables.');
    // In a production environment, you might want to throw an error
    // but for development, we can log and prevent the app from crashing.
    // However, Firestore will not be available.
    throw new Error('Firebase Admin SDK initialization failed: Service account key is missing.');
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
