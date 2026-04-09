// firebase/config.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDl5xMNwEzZrn5BEpjN4yNHutL1yU3EZEU",
  authDomain: "studyspark-11153.firebaseapp.com",
  projectId: "studyspark-11153",
  storageBucket: "studyspark-11153.firebasestorage.app",
  messagingSenderId: "983624107757",
  appId: "1:983624107757:android:6b88d8df0c6d406e58eee4"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage (yeh warning fix karega)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export default app;