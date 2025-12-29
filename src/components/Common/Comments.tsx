
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
    limit
} from "firebase/firestore";
import { useAppSelector } from "../../store/hooks";
import { toast } from "react-toastify";
import { AiOutlineSend, AiOutlineMessage } from "react-icons/ai";
import { formatDistanceToNow } from "date-fns";

interface Comment {
    id: string;
    text: string;
    userDisplayName: string;
    userPhotoURL: string;
    userId: string;
    createdAt: any;
}

interface CommentsProps {
    mediaId: string;
    mediaType: "movie" | "tv";
}

const Comments: FC<CommentsProps> = ({ mediaId, mediaType }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentUser = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        const q = query(
            collection(db, "comments"),
            where("mediaId", "==", mediaId),
            where("mediaType", "==", mediaType),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const commentsData: Comment[] = [];
            querySnapshot.forEach((doc) => {
                commentsData.push({ id: doc.id, ...doc.data() } as Comment);
            });
            setComments(commentsData);
        }, (error) => {
            console.error("Comments subscription error:", error);
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

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "comments"), {
                mediaId,
                mediaType,
                text: newComment,
                userId: currentUser.uid,
                userDisplayName: currentUser.displayName || "Anonymous",
                userPhotoURL: currentUser.photoURL || "",
                createdAt: serverTimestamp(),
            });
            setNewComment("");
        } catch (error) {
            console.error("Error sending comment:", error);
            toast.error("Failed to send comment.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 bg-dark-lighten rounded-3xl p-6 border border-white/5 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <AiOutlineMessage className="text-primary" />
                Discussion <span className="text-gray-500 text-sm font-medium">({comments.length})</span>
            </h2>

            <form onSubmit={handleSendComment} className="mb-8 relative">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={currentUser ? "Share your thoughts about this..." : "Sign in to join the discussion"}
                    disabled={!currentUser || isSubmitting}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-primary transition pr-16"
                />
                <button
                    type="submit"
                    disabled={!currentUser || isSubmitting || !newComment.trim()}
                    className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-black rounded-xl font-bold hover:bg-white transition disabled:opacity-50 flex items-center justify-center shadow-lg"
                >
                    {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    ) : (
                        <AiOutlineSend size={20} />
                    )}
                </button>
            </form>

            <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar">
                {comments.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 italic text-sm">No comments yet. Be the first to start the conversation!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/10 bg-dark shadow-md">
                                <img
                                    src={comment.userPhotoURL || `https://ui-avatars.com/api/?name=${comment.userDisplayName}&background=random`}
                                    alt={comment.userDisplayName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-white">{comment.userDisplayName}</span>
                                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                        {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate()) + " ago" : "Just now"}
                                    </span>
                                </div>
                                <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-gray-300 text-sm leading-relaxed group-hover:border-primary/20 transition">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Comments;
