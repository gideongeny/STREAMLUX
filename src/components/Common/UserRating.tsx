import React, { useState, useEffect } from 'react';
import { db } from '../../shared/firebase';
import {
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs,
} from 'firebase/firestore';
import { useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

interface UserRatingProps {
    mediaId: string;
    mediaType: 'movie' | 'tv';
    compact?: boolean;
}

const UserRating: React.FC<UserRatingProps> = ({ mediaId, mediaType, compact = false }) => {
    const [userRating, setUserRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [avgRating, setAvgRating] = useState<number>(0);
    const [totalRatings, setTotalRatings] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentUser = useAppSelector((state) => state.auth.user);

    const ratingDocId = `${mediaType}_${mediaId}`;

    // Load user's existing rating
    useEffect(() => {
        if (!currentUser || !mediaId) return;
        const userRatingRef = doc(db, 'user_ratings', `${currentUser.uid}_${ratingDocId}`);
        getDoc(userRatingRef).then((snap) => {
            if (snap.exists()) setUserRating(snap.data().rating ?? 0);
        }).catch(() => { });
    }, [currentUser, ratingDocId]);

    // Subscribe to aggregate rating
    useEffect(() => {
        if (!mediaId) return;
        const aggRef = doc(db, 'media_ratings', ratingDocId);
        const unsub = onSnapshot(aggRef, (snap) => {
            if (snap.exists()) {
                setAvgRating(snap.data().average ?? 0);
                setTotalRatings(snap.data().count ?? 0);
            }
        }, () => { });
        return () => unsub();
    }, [ratingDocId]);

    const handleRate = async (rating: number) => {
        if (!currentUser) {
            toast.info('Sign in to rate this title');
            return;
        }
        if (!mediaId || isSubmitting) return;

        setIsSubmitting(true);
        const originalRating = userRating;
        setUserRating(rating);

        try {
            const userRatingDocId = `${currentUser.uid}_${ratingDocId}`;
            const userRatingRef = doc(db, 'user_ratings', userRatingDocId);

            await setDoc(userRatingRef, {
                userId: currentUser.uid,
                mediaId: String(mediaId),
                mediaType,
                rating,
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            // Recalculate aggregate using a new query to be sure
            const q = query(
                collection(db, 'user_ratings'),
                where('mediaId', '==', String(mediaId)),
                where('mediaType', '==', mediaType)
            );

            const snap = await getDocs(q);
            const docs = snap.docs;

            if (docs.length > 0) {
                const total = docs.reduce((acc, d) => acc + (d.data().rating || 0), 0);
                const count = docs.length;
                const average = Math.round((total / count) * 10) / 10;

                const mediaRatingRef = doc(db, 'media_ratings', ratingDocId);
                await setDoc(mediaRatingRef, {
                    mediaId: String(mediaId),
                    mediaType,
                    average,
                    count,
                    lastUpdated: new Date().toISOString()
                }, { merge: true });

                setAvgRating(average);
                setTotalRatings(count);
            }

            toast.success(`Rated ${rating}/10 ⭐`, { autoClose: 1500 });
        } catch (error) {
            console.error('Rating error details:', error);
            setUserRating(originalRating); // Revert on failure
            toast.error('Failed to save rating. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayRating = hoverRating || userRating;

    if (compact) {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRate(star * 2)}
                        onMouseEnter={() => setHoverRating(star * 2)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none"
                    >
                        {displayRating >= star * 2 ? (
                            <AiFillStar className="text-yellow-400" size={14} />
                        ) : (
                            <AiOutlineStar className="text-gray-500 hover:text-yellow-400" size={14} />
                        )}
                    </button>
                ))}
                {totalRatings > 0 && (
                    <span className="text-[10px] text-gray-400 ml-1">{avgRating}</span>
                )}
            </div>
        );
    }

    return (
        <div className="bg-dark-lighten rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AiFillStar className="text-yellow-400" />
                Rate This Title
            </h3>

            <div className="flex gap-1 mb-3 flex-wrap">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={isSubmitting}
                        className="focus:outline-none transition-transform hover:scale-125"
                        title={`Rate ${star}/10`}
                    >
                        {displayRating >= star ? (
                            <AiFillStar className="text-yellow-400" size={22} />
                        ) : (
                            <AiOutlineStar className="text-gray-600 hover:text-yellow-300" size={22} />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                    {hoverRating > 0
                        ? `${hoverRating}/10`
                        : userRating > 0
                            ? `Your rating: ${userRating}/10`
                            : 'Tap a star to rate'}
                </span>
                {totalRatings > 0 && (
                    <span className="text-gray-400">
                        ⭐ {avgRating}/10 · {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default UserRating;
