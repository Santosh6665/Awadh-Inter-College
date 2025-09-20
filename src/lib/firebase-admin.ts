import admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(serviceAccountString);
} catch (error) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON string.');
}


if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const firestore = admin.firestore();
