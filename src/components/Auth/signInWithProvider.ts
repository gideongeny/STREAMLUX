import { FacebookAuthProvider, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, db } from "../../shared/firebase";
import { convertErrorCodeToMessage } from "../../shared/utils";

export const signInWithProvider = async (provider: any, type: string) => {
  if (!auth || !db) {
    toast.error("Authentication service is not available. Please refresh the page.");
    throw new Error("Firebase not initialized");
  }

  try {
    toast.info(`Opening ${type} login...`);

    // Use signInWithPopup for ALL platforms.
    // On Android/Capacitor, the WebView handles the popup inline without leaving the app.
    // signInWithRedirect was causing "localhost" / DNS issues because it navigated
    // the external browser to a non-existent domain on return.
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

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
      createdAt: new Date().toISOString(),
    });

    toast.success("Account created and signed in successfully!", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (error: any) {
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
