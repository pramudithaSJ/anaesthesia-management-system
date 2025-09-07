import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Validate environment variables
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if we're in a build environment or if any required env vars are missing
const isBuildTime = typeof window === 'undefined' && (
  process.env.NODE_ENV === 'production' || 
  process.env.NEXT_PHASE === 'phase-production-build'
);
const missingVars = Object.entries(requiredEnvVars).filter(([, value]) => !value);

if (!isBuildTime && missingVars.length > 0) {
  console.error('Missing required Firebase environment variables:', missingVars.map(([key]) => key));
  throw new Error(`Missing Firebase environment variables: ${missingVars.map(([key]) => key).join(', ')}`);
}

// Firebase configuration
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || '',
  authDomain: requiredEnvVars.authDomain || '',
  projectId: requiredEnvVars.projectId || '',
  storageBucket: requiredEnvVars.storageBucket || '',
  messagingSenderId: requiredEnvVars.messagingSenderId || '',
  appId: requiredEnvVars.appId || '',
};

// Initialize Firebase (prevent multiple initialization)
let app;
if (isBuildTime) {
  // During build time, create a mock app to prevent errors
  app = null;
} else {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

// Initialize services with null checks
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export default app;