import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: User must replace these with their own Firebase project credentials
// You can find these in your Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCBrGDTFuRUTnNGW2PikQqz1uGZjFItLbs",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "v-org-project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "v-org-project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "v-org-project.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "977706628524",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:977706628524:web:5ea99ec6a0b728e5153609"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
