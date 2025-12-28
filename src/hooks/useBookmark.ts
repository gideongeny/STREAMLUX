import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { db } from "../shared/firebase";
import { Item } from "../shared/types";
import { useAppSelector } from "../store/hooks";

export const useBookmark = (item: Item | null) => {
    const currentUser = useAppSelector((state) => state.auth.user);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentUser || !item) {
            setIsLoading(false);
            return;
        }

        const unsubDoc = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
            setIsBookmarked(
                docSnap.data()?.bookmarks.some((bookmark: any) => bookmark.id === item.id)
            );
            setIsLoading(false);
        });

        return () => unsubDoc();
    }, [currentUser, item?.id]);

    const toggleBookmark = async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }

        if (!item) return;

        if (!currentUser) {
            toast.error("You need to sign in to bookmark films", {
                position: "top-right",
                autoClose: 2000,
            });
            return;
        }

        try {
            const bookmarkItem = {
                poster_path: item.poster_path,
                id: item.id,
                vote_average: item.vote_average,
                media_type: item.media_type,
                ...(item.media_type === "movie" && { title: item.title }),
                ...(item.media_type === "tv" && { name: item.name }),
            };

            await updateDoc(doc(db, "users", currentUser.uid), {
                bookmarks: !isBookmarked
                    ? arrayUnion(bookmarkItem)
                    : arrayRemove(bookmarkItem),
            });

            toast.success(
                !isBookmarked
                    ? "Added to your list"
                    : "Removed from your list",
                {
                    position: "top-right",
                    autoClose: 2000,
                }
            );
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            toast.error("Failed to update bookmark");
        }
    };

    return { isBookmarked, toggleBookmark, isLoading };
};
