import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, indexedDBLocalPersistence, browserPopupRedirectResolver, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// StreamLux Firebase Configuration
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Firebase web config is not a secret, but we keep it configurable via env.
// If env is missing (common for direct Hosting deployments), fall back to the
// known project config so the app still boots.
const fallbackConfig = {
  apiKey: "AIzaSyAsdilIMvU76E8XbMc0bl8b0lEnNnUw4jY",
  authDomain: "streamlux-67a84.firebaseapp.com",
  projectId: "streamlux-67a84",
  storageBucket: "streamlux-67a84.firebasestorage.app",
  messagingSenderId: "242283846154",
  appId: "1:242283846154:web:c25b7416322f092cc49df3",
  measurementId: "G-3C0V66LLLR",
};

const firebaseConfig =
  envConfig.apiKey && envConfig.authDomain && envConfig.projectId
    ? envConfig
    : fallbackConfig;

import { getFunctions } from "firebase/functions";

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

// Initialize Functions
const functions = getFunctions(app);

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

export { db, auth, functions };

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
    const isDevelopment = import.meta.env.DEV;
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
