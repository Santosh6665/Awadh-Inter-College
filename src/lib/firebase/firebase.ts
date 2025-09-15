import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "studio-4100878359-6f112",
  appId: "1:530813036390:web:3eb2f58e98329bb5670aa7",
  storageBucket: "studio-4100878359-6f112.firebasestorage.app",
  apiKey: "AIzaSyDzD9CJlYAN7w9r8nrsv_tj9xDKt08mVII",
  authDomain: "studio-4100878359-6f112.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "530813036390",
  databaseURL: "https://studio-4100878359-6f112-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
