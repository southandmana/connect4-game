import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// Firebase is optional - if no env vars, online mode will be disabled
let database = null;
let firebaseEnabled = false;

try {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }

  // Check if we have at least the minimum required config
  const hasMinimumConfig = firebaseConfig.apiKey && firebaseConfig.authDomain && 
                           firebaseConfig.databaseURL && firebaseConfig.projectId;
  
  if (hasMinimumConfig) {
    const app = initializeApp(firebaseConfig)
    database = getDatabase(app, firebaseConfig.databaseURL)
    firebaseEnabled = true;
    console.log('Firebase initialized successfully')
  } else {
    console.warn('Firebase configuration incomplete - online multiplayer will be disabled')
  }
} catch (error) {
  console.warn('Firebase initialization skipped:', error.message)
  console.log('App will run in offline mode only')
}

export { database, firebaseEnabled }