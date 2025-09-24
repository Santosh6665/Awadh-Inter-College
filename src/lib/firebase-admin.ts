
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
    const errorMessage = 'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set or is not a valid JSON object. Firebase Admin SDK could not be initialized.';
    console.error(errorMessage);
    // In a server environment, it's better to throw an error to make the configuration issue obvious.
    // This prevents silent failures and hard-to-debug runtime errors.
    throw new Error(errorMessage);
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return admin.firestore();
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    // Re-throw the error to ensure the server fails fast if initialization is incorrect.
    throw new Error('Failed to initialize Firebase Admin SDK.'); 
  }
}

// Initialize and export firestore.
// Any file importing 'firestore' from here will get the initialized instance or null.
export const firestore = initializeFirebaseAdmin();
