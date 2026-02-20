
import { FC, useState, useEffect } from "react";
import { db } from "../../shared/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    limit,
    Timestamp,
    doc,
    updateDoc,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import { useAppSelector } from "../../store/hooks";
import { toast } from "react-toastify";
import { AiOutlineSend, AiOutlineMessage } from "react-icons/ai";
import { FiThumbsUp } from "react-icons/fi";
import { format, formatDistanceToNow } from "date-fns";

interface Comment {
    id: string;
    text: string;
    userDisplayName: string;
    userPhotoURL: string;
    userId: string;
    createdAt: Timestamp | null;
    likes?: string[]; // array of user UIDs
}

interface CommentsProps {
    mediaId: string;
    mediaType: "movie" | "tv";
}

const MAX_CHARS = 500;

const formatTimestamp = (ts: Timestamp | null): string => {
    if (!ts) return "Just now";
    try {
        const date = ts.toDate();
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 24) {
            return formatDistanceToNow(date, { addSuffix: true });
        }
        return format(date, "MMM d, yyyy 'at' h:mm a");
    } catch {
        return "Just now";
    }
};

const Comments: FC<CommentsProps> = ({ mediaId, mediaType }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        if (!mediaId) return;
        setIsLoading(true);

        // Query without composite index requirement: just filter by mediaId + mediaType
        // Then sort on client side to avoid needing a composite index
        const q = query(
            collection(db, "comments"),
            where("mediaId", "==", mediaId),
            where("mediaType", "==", mediaType),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const commentsData: Comment[] = [];
            querySnapshot.forEach((docSnap) => {
                commentsData.push({ id: docSnap.id, ...docSnap.data() } as Comment);
            });

            // Sort client-side by createdAt descending (newest first)
            commentsData.sort((a, b) => {
                const aTime = a.createdAt?.toMillis() ?? Date.now();
                const bTime = b.createdAt?.toMillis() ?? Date.now();
                return bTime - aTime;
            });

            setComments(commentsData);
            setIsLoading(false);
        }, (error) => {
            console.error("Comments subscription error:", error);
            // If composite index error, gracefully fall back
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [mediaId, mediaType]);

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            toast.info("Please sign in to comment");
            return;
        }
        if (!newComment.trim()) return;
        if (newComment.length > MAX_CHARS) {
            toast.error(`Comment too long (max ${MAX_CHARS} characters)`);
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "comments"), {
                mediaId,
                mediaType,
                text: newComment.trim(),
                userId: currentUser.uid,
                userDisplayName: currentUser.displayName || "Anonymous",
                userPhotoURL: currentUser.photoURL || "",
                createdAt: serverTimestamp(),
                likes: [],
            });
            setNewComment("");
            toast.success("Comment posted!", { autoClose: 1500 });
        } catch (error) {
            console.error("Error sending comment:", error);
            toast.error("Failed to post comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async (commentId: string, currentLikes: string[]) => {
        if (!currentUser) {
            toast.info("Please sign in to like comments");
            return;
        }
        const commentRef = doc(db, "comments", commentId);
        const hasLiked = currentLikes.includes(currentUser.uid);
        try {
            await updateDoc(commentRef, {
                likes: hasLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
            });
        } catch (err) {
            console.error("Like error:", err);
        }
    };

    const charsLeft = MAX_CHARS - newComment.length;

    return (
        <div className="mt-12 bg-dark-lighten rounded-3xl p-6 border border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <AiOutlineMessage className="text-primary" />
                Discussion{" "}
                <span className="text-gray-500 text-sm font-medium">
                    ({comments.length})
                </span>
            </h2>

            {/* Comment Input */}
            <form onSubmit={handleSendComment} className="mb-8">
                <div className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={
                            currentUser
                                ? "Share your thoughts about this..."
                                : "Sign in to join the discussion"
                        }
                        disabled={!currentUser || isSubmitting}
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition pr-6 resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <span
                            className={`text-xs ${charsLeft < 50 ? "text-red-400" : "text-gray-500"
                                }`}
                        >
                            {charsLeft} characters remaining
                        </span>
                        <button
                            type="submit"
                            disabled={!currentUser || isSubmitting || !newComment.trim()}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-xl font-bold hover:bg-white transition disabled:opacity-50 shadow-lg"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <AiOutlineSend size={18} />
                                    Post
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6 max-h-[600px] overflow-y-auto no-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-10">
                        <AiOutlineMessage size={40} className="text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 italic text-sm">
                            No comments yet. Be the first to start the conversation!
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => {
                        const likes = comment.likes ?? [];
                        const hasLiked = currentUser ? likes.includes(currentUser.uid) : false;
                        return (
                            <div key={comment.id} className="flex gap-4 group animate-fadeIn">
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border border-white/10 bg-dark shadow-md">
                                    <img
                                        src={
                                            comment.userPhotoURL ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                                comment.userDisplayName
                                            )}&background=random&color=fff&bold=true`
                                        }
                                        alt={comment.userDisplayName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="font-bold text-white text-sm">
                                            {comment.userDisplayName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatTimestamp(comment.createdAt)}
                                        </span>
                                    </div>
                                    <div className="bg-black/20 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/5 text-gray-300 text-sm leading-relaxed group-hover:border-primary/20 transition">
                                        {comment.text}
                                    </div>

                                    {/* Like button */}
                                    <button
                                        onClick={() => handleLike(comment.id, likes)}
                                        className={`flex items-center gap-1.5 mt-2 text-xs px-3 py-1 rounded-full transition-colors ${hasLiked
                                                ? "text-primary bg-primary/10 border border-primary/30"
                                                : "text-gray-500 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <FiThumbsUp size={13} />
                                        <span>{likes.length > 0 ? likes.length : ""} Like</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Comments;
