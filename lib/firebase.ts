// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (isDevelopment ? "AIzaSyAsyl-M2O30Zu2Gyy4_bDAVud_-VsPnO_c" : undefined),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isDevelopment ? "la-pure-a34c0.firebaseapp.com" : undefined),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isDevelopment ? "la-pure-a34c0" : undefined),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (isDevelopment ? "la-pure-a34c0.firebasestorage.app" : undefined),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (isDevelopment ? "1071134391639" : undefined),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (isDevelopment ? "1:1071134391639:web:7a0eb4a6f7d7b30eb61212" : undefined),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || (isDevelopment ? "G-0V0YHJKDN0" : undefined)
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Analytics only in the browser
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, auth, storage, analytics }; 