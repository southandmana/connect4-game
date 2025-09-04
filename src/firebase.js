import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyD3o51f3DcMj91IiFEwJn9rjongDVrOs2A",
  authDomain: "connect4-multiplayer-7e443.firebaseapp.com",
  databaseURL: "https://connect4-multiplayer-7e443-default-rtdb.firebaseio.com",
  projectId: "connect4-multiplayer-7e443",
  storageBucket: "connect4-multiplayer-7e443.firebasestorage.app",
  messagingSenderId: "127037034989",
  appId: "1:127037034989:web:62ee0c441a901608ae97e4"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app, firebaseConfig.databaseURL)