import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Firebase configuration - this is safe to be public as security is handled by Firebase Security Rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD3o51f3DcMj91IiFEwJn9rjongDVrOs2A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "connect4-multiplayer-7e443.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://connect4-multiplayer-7e443-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "connect4-multiplayer-7e443",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "connect4-multiplayer-7e443.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "127037034989",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:127037034989:web:62ee0c441a901608ae97e4"
}

// Initialize Firebase - will use env vars if available, otherwise use embedded config
let database = null;
let firebaseEnabled = false;

try {
  const app = initializeApp(firebaseConfig)
  database = getDatabase(app, firebaseConfig.databaseURL)
  firebaseEnabled = true;
  console.log('Firebase initialized successfully')
} catch (error) {
  console.error('Firebase initialization failed:', error)
  // Still export null database to prevent crashes
  database = null;
  firebaseEnabled = false;
}

export { database, firebaseEnabled }