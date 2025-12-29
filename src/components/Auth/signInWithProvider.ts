import { FacebookAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, db } from "../../shared/firebase";
import { convertErrorCodeToMessage } from "../../shared/utils";

export const signInWithProvider = async (provider: any, type: string) => {
  if (!auth || !db) {
    toast.error("Authentication service is not available. Please refresh the page.");
    throw new Error("Firebase not initialized");
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Optimized: Check if user exists by directly accessing the document instead of querying all users
    // This reduces Firestore quota usage significantly
    let isStored = false;
    try {
      const { getDoc } = await import("firebase/firestore");
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      isStored = userDoc.exists();
    } catch (error) {
      // If quota exceeded or other error, assume user doesn't exist and continue
      console.warn("Error checking user existence:", error);
      isStored = false;
    }

    let token: string | undefined;
    if (type === "facebook") {
      const credential = FacebookAuthProvider.credentialFromResult(result);
      token = credential?.accessToken || undefined;
    }

    // Construct user data object
    const userData: any = {
      firstName: user.displayName?.split(" ")[0] || "",
      lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
      ...(type === "google" && { photoUrl: user.photoURL || "" }),
      ...(type === "facebook" && {
        photoUrl: user.photoURL ? user.photoURL + "?access_token=" + token : "",
      }),
    };

    // Only initialize bookmarks and history for NEW users to avoid wiping existing data
    if (!isStored) {
      userData.bookmarks = [];
      userData.recentlyWatch = [];
    }

    if (type === "facebook" && token) {
      userData.token = token;
    }

    // Always use merge: true to avoid deleting other fields (like profiles, history)
    await setDoc(doc(db, "users", user.uid), userData, { merge: true });

    toast.success(isStored ? "Signed in successfully!" : "Account created and signed in successfully!", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error: any) {
    console.error("Sign in error:", error);

    if (error.code === "auth/popup-blocked") {
      toast.error("Sign-in popup was blocked! Please allow popups in your browser settings to sign in with Google/Facebook.", {
        position: "top-right",
        autoClose: 6000,
      });
      return;
    }

    const errorMessage = convertErrorCodeToMessage(error.code) || error.message || "Failed to sign in. Please try again.";
    toast.error(errorMessage, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }
};
