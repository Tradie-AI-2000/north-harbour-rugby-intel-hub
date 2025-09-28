import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "north-harbour-rugby.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "north-harbour-rugby",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "north-harbour-rugby.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development' && !globalThis.FIRESTORE_EMULATOR_INITIALIZED) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    globalThis.FIRESTORE_EMULATOR_INITIALIZED = true;
  } catch (error) {
    // Emulators already connected
  }
}

export { app };
