import { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export interface WatchProgress {
    mediaId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string;
    currentTime: number;
    duration: number;
    progress: number; // percentage
    timestamp: number;
    seasonNumber?: number;
    episodeNumber?: number;
}

const STORAGE_KEY = 'streamlux_watch_progress';

export const useWatchProgress = () => {
    const [watchHistory, setWatchHistory] = useState<WatchProgress[]>([]);
    const auth = getAuth();
    const db = getFirestore();

    const loadWatchHistory = useCallback(async () => {
        try {
            // Load from localStorage first (instant)
            const localData = localStorage.getItem(STORAGE_KEY);
            if (localData) {
                const parsed = JSON.parse(localData);
                if (Array.isArray(parsed)) {
                    setWatchHistory(parsed);
                } else {
                    console.warn("Corrupt watch history in localStorage, resetting.");
                    localStorage.removeItem(STORAGE_KEY);
                    setWatchHistory([]);
                }
            }

            // Sync with Firebase if logged in
            if (auth.currentUser) {
                const historyRef = collection(db, 'users', auth.currentUser.uid, 'watchProgress');
                const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
                const snapshot = await getDocs(q);

                const firebaseData: WatchProgress[] = [];
                snapshot.forEach((doc) => {
                    firebaseData.push(doc.data() as WatchProgress);
                });

                if (firebaseData.length > 0) {
                    setWatchHistory(firebaseData);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseData));
                }
            }
        } catch (error) {
            console.error('Error loading watch history:', error);
        }
    }, [auth.currentUser, db]);

    // Load watch history from localStorage and Firebase
    useEffect(() => {
        loadWatchHistory();
    }, [auth.currentUser, loadWatchHistory]);

    const saveProgress = async (progress: WatchProgress) => {
        try {
            // Update local state
            const updated = [progress, ...watchHistory.filter(item =>
                !(item.mediaId === progress.mediaId && item.mediaType === progress.mediaType)
            )].slice(0, 20); // Keep max 20 items

            setWatchHistory(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            // Sync to Firebase if logged in
            if (auth.currentUser) {
                const docRef = doc(db, 'users', auth.currentUser.uid, 'watchProgress', `${progress.mediaType}_${progress.mediaId}`);
                await setDoc(docRef, progress, { merge: true });
            }
        } catch (error) {
            console.error('Error saving watch progress:', error);
        }
    };

    const getProgress = async (mediaId: number, mediaType: 'movie' | 'tv'): Promise<WatchProgress | null> => {
        try {
            // Check localStorage first
            const item = watchHistory.find(w => w.mediaId === mediaId && w.mediaType === mediaType);
            if (item) return item;

            // Check Firebase
            if (auth.currentUser) {
                const docRef = doc(db, 'users', auth.currentUser.uid, 'watchProgress', `${mediaType}_${mediaId}`);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    return docSnap.data() as WatchProgress;
                }
            }

            return null;
        } catch (error) {
            console.error('Error getting watch progress:', error);
            return null;
        }
    };

    const clearProgress = async (mediaId: number, mediaType: 'movie' | 'tv') => {
        try {
            const updated = watchHistory.filter(item =>
                !(item.mediaId === mediaId && item.mediaType === mediaType)
            );
            setWatchHistory(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Error clearing progress:', error);
        }
    };

    return {
        watchHistory,
        saveProgress,
        getProgress,
        clearProgress,
        loadWatchHistory,
    };
};
