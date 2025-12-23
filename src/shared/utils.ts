import { EMBED_TO, IMAGE_URL } from "./constants";

export const resizeImage = (
  imageUrl: string,
  width: string = "original"
): string => `${IMAGE_URL}/${width}${imageUrl}`;

// export const embedMovie = (id: number): string =>
//   `${EMBED_URL}/movie?tmdb=${id}`;

// export const embedMovie = (id: number): string => `${EMBED_VIDSRC}/${id}`;

export const embedMovie = (id: number): string => `${EMBED_TO}/movie?id=${id}`;

// export const embedTV = (id: number, season: number, episode: number): string =>
//   `${EMBED_URL}/series?tmdb=${id}&sea=${season}&epi=${episode}`;

// export const embedTV = (id: number, season: number, episode: number): string =>
//   `${EMBED_VIDSRC}/${id}/${season}-${episode}`;

export const embedTV = (id: number, season: number, episode: number): string =>
  `${EMBED_TO}/tv?id=${id}&s=${season}&e=${episode}`;

export const calculateTimePassed = (time: number): string => {
  const unit = {
    year: 12 * 30 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
  };

  const diff = Date.now() - time;
  for (const key in unit) {
    if (diff > unit[key as keyof typeof unit]) {
      const timePassed = Math.floor(diff / unit[key as keyof typeof unit]);
      return `${timePassed} ${key}${timePassed > 1 ? "s" : ""}`;
    }
  }

  return "Just now";
};

export const convertErrorCodeToMessage = (errorCode: string): string => {
  const errorMessages: { [key: string]: string } = {
    "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
    "auth/user-not-found": "No account found with this email. Please check your email or sign up.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/popup-closed-by-user": "Sign-in popup was closed. Please try again.",
    "auth/cancelled-popup-request": "Sign-in was cancelled. Please try again.",
    "auth/popup-blocked": "Popup was blocked by your browser. Please allow popups and try again.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
    "auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/invalid-credential": "Invalid credentials. Please check your email and password.",
    "auth/requires-recent-login": "Please sign out and sign in again to continue.",
  };
  
  return errorMessages[errorCode] || `Authentication error: ${errorCode}. Please try again or contact support.`;
};

export const getRandomAvatar = (): string => {
  const avatars = [
    "https://i.ibb.co/zrXfKsJ/catface-7.jpg",
    "https://i.ibb.co/CJqGvY6/satthudatinh.jpg",
    "https://i.ibb.co/rd3PGq5/catface-9.png",
    "https://i.ibb.co/Htq4LWJ/catface-8.png",
    "https://i.ibb.co/9mPr2ds/catface-3.jpg",
    "https://i.ibb.co/b6TT6Y4/catface-6.jpg",
    "https://i.ibb.co/0pNx0nv/catface-4.jpg",
    "https://i.ibb.co/StzXrVH/catface.jpg",
    "https://i.ibb.co/KDdd4zN/catface-2.jpg",
    "https://i.ibb.co/stB42Nb/catface-5.jpg",
  ];

  return avatars[Math.floor(Math.random() * avatars.length)];
};
