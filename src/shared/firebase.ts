import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, indexedDBLocalPersistence, browserPopupRedirectResolver, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// StreamLux Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "streamlux-67a84.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "streamlux-67a84",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "streamlux-67a84.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "242283846154",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:242283846154:web:c25b7416322f092cc49df3",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-3C0V66LLLR"
};

// Initialize Firebase app (singleton)
let app: ReturnType<typeof initializeApp>;
const existingApps = getApps();
if (existingApps.length > 0) {
  app = existingApps[0];
} else {
  app = initializeApp(firebaseConfig);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth with IndexedDB persistence.
// This is critical for Capacitor / Android WebView environments:
// The default auth state is stored in sessionStorage, which is lost when Firebase
// navigates to its auth handler page (firebaseapp.com) due to cross-origin
// storage partitioning. IndexedDB is not partitioned in the same way, so it
// survives the origin change and the auth flow completes correctly.
let auth: ReturnType<typeof initializeAuth>;
try {
  auth = initializeAuth(app, {
    persistence: indexedDBLocalPersistence,
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch (e: any) {
  // If auth is already initialized (hot reload), get the existing instance
  auth = getAuth(app);
}

export { db, auth };

// Initialize Messaging (FCM)
let messaging: ReturnType<typeof getMessaging> | undefined;
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn("Firebase Messaging initialization failed:", error);
  }
}

export { messaging };

// Initialize Analytics (only in browser environment, not in dev)
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (globalThis.window !== undefined) {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const analyticsDisabled = localStorage.getItem('analytics_disabled') === 'true';
    if (!isDevelopment && !analyticsDisabled && app) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('quota')) {
      console.warn("Analytics quota exceeded. Analytics disabled.");
      localStorage.setItem('analytics_disabled', 'true');
    } else {
      console.warn("Firebase Analytics initialization failed:", error);
    }
  }
}

export { analytics };
