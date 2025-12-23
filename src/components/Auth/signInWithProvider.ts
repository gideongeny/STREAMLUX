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

    if (isStored) {
      toast.success("Signed in successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }

    let token;
    if (type === "facebook") {
      // If logined with facebook, I need to store additional info about "token" because I can only get profile picture "photoURL" from FB API when I add "?access_token={someToken}", so I store that "someToken" is my FireStore
      const credential = FacebookAuthProvider.credentialFromResult(result);
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
    });

    toast.success("Account created and signed in successfully!", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error: any) {
    console.error("Sign in error:", error);
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
