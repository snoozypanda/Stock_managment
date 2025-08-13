// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "Yourapikey",
  authDomain: "Authapi",
  databaseURL: "Your firebase db url",
  projectId: "Project Url",
  storageBucket: "storage bucket url",
  messagingSenderId: "APi request id",
  appId: "Web app id",
  measurementId: "Measurementid",
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
