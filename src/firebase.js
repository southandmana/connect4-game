import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyDt7nqPxn0VZ_hfgXwXpLqnC1EhWxPtKzE",
  authDomain: "connect4-game-demo.firebaseapp.com",
  databaseURL: "https://connect4-game-demo-default-rtdb.firebaseio.com",
  projectId: "connect4-game-demo",
  storageBucket: "connect4-game-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)