import { FacebookAuthProvider, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signInWithCredential } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";
import { toast } from "react-toastify";
import { auth, db } from "../../shared/firebase";
import { convertErrorCodeToMessage } from "../../shared/utils";

export const signInWithProvider = async (provider: any, type: string) => {
  if (!auth || !db) {
    toast.error("Authentication service is not available. Please refresh the page.");
    throw new Error("Firebase not initialized");
  }

  try {
    const platform = Capacitor.getPlatform();
    const isNative = platform === 'android' || platform === 'ios';

    let user: any;

    if (isNative && type === 'google') {
      // ✅ TRUE NATIVE Google Sign-In on Android/iOS
      // With the app package properly set to `com.streamlux.app` and matching the 
      // verified SHA-1 fingerprint inside google-services.json, this native 
      // call will successfully generate the Google Token without WebView blocking or crashing.
      toast.info('Opening Google Sign-In...');

      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');

      await GoogleAuth.initialize({
        clientId: '242283846154-t9ji7cvhfbobegog438kgdvedf2nq5ra.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser.authentication.idToken;
      
      if (!idToken) throw new Error('No ID token returned from Google Sign-In');

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      user = result.user;
      return;
    } else {
      // ✅ Web: Use signInWithPopup (works fine in browsers)
      toast.info(`Opening ${type} login popup...`);
      const result = await signInWithPopup(auth, provider);
      user = result.user;
    }

    // Check if user document already exists in Firestore
    let isStored = false;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      isStored = userDoc.exists();
    } catch (error) {
      console.warn("Error checking user existence:", error);
      isStored = false;
    }

    if (isStored) {
      toast.success("Signed in successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    let token;
    if (type === "facebook") {
      const credential = FacebookAuthProvider.credentialFromResult({ user } as any);
      token = credential?.accessToken;
    }

    await setDoc(doc(db, "users", user.uid), {
      firstName: user.displayName?.split(" ")[0] || "",
      lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
      ...(type === "google" && { photoUrl: user.photoURL || "" }),
      ...(type === "facebook" && {
        photoUrl: user.photoURL ? user.photoURL + "?access_token=" + token : "",
      }),
      bookmarks: [],
      recentlyWatch: [],
      ...(type === "facebook" && { token }),
      createdAt: new Date().toISOString(),
    });

    toast.success("Account created and signed in successfully!", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error: any) {
    // User cancelled the sign-in
    if (error.message === 'The user canceled the sign-in flow.' || error.error === 'popup_closed_by_user') {
      return;
    }
    console.error('[Auth] Sign-in error:', error);
    const errorMessage = convertErrorCodeToMessage(error.code) || error.message || "Failed to sign in. Please try again.";
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    throw error;
  }
};
