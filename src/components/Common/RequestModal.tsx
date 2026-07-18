
import { FC, useState } from "react";
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import { db } from "../../shared/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RequestModal: FC<RequestModalProps> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState("");
    const [year, setYear] = useState("");
    const [type, setType] = useState("movie");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "requests"), {
                title,
                year,
                type,
                timestamp: serverTimestamp(),
                status: "pending",
                requestedBy: "Anonymous" // Can be updated to user ID if auth is used
            });
            toast.success("Request submitted! We will add it soon.");
            setTitle("");
            setYear("");
            onClose();
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error("Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1f2937] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-scale-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <AiOutlineClose size={24} />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-primary italic">!</span> Request Content
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Can't find what you're looking for? Let us know!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Title Name</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Deadpool & Wolverine"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Release Year</label>
                            <input
                                type="text"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="e.g. 2024"
                                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Type</label>
                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition appearance-none cursor-pointer pr-10"
                                >
                                    <option className="bg-dark text-white" value="movie">Movie</option>
                                    <option className="bg-dark text-white" value="tv">TV Show</option>
                                    <option className="bg-dark text-white" value="short">Short Drama</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full mt-4 py-4 bg-primary text-black font-extrabold rounded-xl hover:bg-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <AiOutlineSend size={18} />
                                Submit Request
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RequestModal;
