import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const env = import.meta.env;

const firebaseConfig = {
  apiKey: (env["VITE_FIREBASE_API_KEY"] as string | undefined) || "AIzaSyDemoPlaceholderApiKeyForTracker",
  authDomain: (env["VITE_FIREBASE_AUTH_DOMAIN"] as string | undefined) || "student-expense-tracker.firebaseapp.com",
  projectId: (env["VITE_FIREBASE_PROJECT_ID"] as string | undefined) || "student-expense-tracker",
  storageBucket: (env["VITE_FIREBASE_STORAGE_BUCKET"] as string | undefined) || "student-expense-tracker.appspot.com",
  messagingSenderId: (env["VITE_FIREBASE_MESSAGING_SENDER_ID"] as string | undefined) || "123456789012",
  appId: (env["VITE_FIREBASE_APP_ID"] as string | undefined) || "1:123456789012:web:demoappplaceholders",
};

export const isFirebaseConfigured = Boolean(
  env["VITE_FIREBASE_API_KEY"] && env["VITE_FIREBASE_PROJECT_ID"]
);

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
