// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCg9Xn5TcY3QFymaC1ZTHcTp1xAkZtxT5c",
  authDomain: "stock-aa1.firebaseapp.com",
  databaseURL: "https://stock-aa1-default-rtdb.firebaseio.com",
  projectId: "stock-aa1",
  storageBucket: "stock-aa1.firebasestorage.app",
  messagingSenderId: "848597732640",
  appId: "1:848597732640:web:ce7fb9a272b84efed7db45",
  measurementId: "G-C376BVMKQB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const database = getDatabase(app);

// Initialize Analytics conditionally (only in production or when supported)
let analytics = null;
isSupported().then((yes) => (yes ? (analytics = getAnalytics(app)) : null));

export { analytics };

export default app;
