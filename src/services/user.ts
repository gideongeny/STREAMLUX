import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "../shared/firebase";
import { UserProfile } from "../shared/types";

const COLLECTION_NAME = "users";
const SUB_COLLECTION = "profiles";

export const getProfiles = async (userId: string): Promise<UserProfile[]> => {
    try {
        const querySnapshot = await getDocs(
            collection(db, COLLECTION_NAME, userId, SUB_COLLECTION)
        );
        const profiles: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            profiles.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
        return profiles;
    } catch (error) {
        console.error("Error getting profiles:", error);
        return [];
    }
};

export const createProfile = async (
    userId: string,
    profile: Omit<UserProfile, "id">
): Promise<UserProfile | null> => {
    try {
        const newProfileRef = doc(collection(db, COLLECTION_NAME, userId, SUB_COLLECTION));
        const newProfile = {
            ...profile,
            createdAt: serverTimestamp(),
        };
        await setDoc(newProfileRef, newProfile);
        return { id: newProfileRef.id, ...profile };
    } catch (error) {
        console.error("Error creating profile:", error);
        return null;
    }
};

export const updateProfile = async (
    userId: string,
    profileId: string,
    updates: Partial<UserProfile>
) => {
    try {
        const profileRef = doc(db, COLLECTION_NAME, userId, SUB_COLLECTION, profileId);
        await updateDoc(profileRef, updates);
        return true;
    } catch (error) {
        console.error("Error updating profile:", error);
        return false;
    }
};

export const deleteProfile = async (userId: string, profileId: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, userId, SUB_COLLECTION, profileId));
        return true;
    } catch (error) {
        console.error("Error deleting profile:", error);
        return false;
    }
};

// Default avatars from Netflix/Generic style (Using verified ImgBB kittens as placeholders)
export const PROFILE_AVATARS = [
    "https://i.ibb.co/zrXfKsJ/catface-7.jpg",
    "https://i.ibb.co/v4bVf9B/catface-6.jpg",
    "https://i.ibb.co/L9Y0YjG/catface-5.jpg",
    "https://i.ibb.co/N2L8H7X/catface-4.jpg",
    "https://i.ibb.co/mS7J9jP/catface-3.jpg",
    "https://i.ibb.co/fH1W17P/catface-2.jpg",
    "https://i.ibb.co/L8y6qR7/catface-1.jpg",
    "https://i.ibb.co/Vv6V6z2/catface-8.jpg",
    "https://i.ibb.co/L8y6qR7/catface-1.jpg", // Kids avatar
];
