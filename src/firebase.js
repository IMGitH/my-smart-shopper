// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Also include auth if you're using it

// Your Firebase configuration (using Vite's environment variables or Canvas injected ones)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, // Or __firebase_config.apiKey in Canvas
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID, // Or __app_id in Canvas
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get service instances
const db = getFirestore(app);
const auth = getAuth(app); // Get the auth instance

// Export them for use in your React components
export { db, auth, app };
