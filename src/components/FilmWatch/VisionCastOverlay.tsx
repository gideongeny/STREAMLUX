import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUsers } from "react-icons/fi";
import axios from "../../shared/axios";
import { resizeImage } from "../../shared/utils";

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string;
}

interface VisionCastOverlayProps {
    mediaId: number | string;
    mediaType: "movie" | "tv";
    isOpen: boolean;
    onClose: () => void;
}

const VisionCastOverlay: React.FC<VisionCastOverlayProps> = ({ mediaId, mediaType, isOpen, onClose }) => {
    const [cast, setCast] = useState<CastMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !mediaId) return;

        const fetchCredits = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`/${mediaType}/${mediaId}/credits`);
                setCast(res.data.cast.slice(0, 12));
            } catch (err) {
                console.error("Failed to fetch Vision Cast:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCredits();
    }, [isOpen, mediaId, mediaType]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="absolute top-0 right-0 h-full w-full md:w-80 bg-black/60 backdrop-blur-3xl z-[200] border-l border-white/5 shadow-2xl overflow-hidden flex flex-col"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-2">
                            <FiUsers className="text-primary" size={20} />
                            <h2 className="text-white font-black uppercase text-sm tracking-widest">Vision <span className="text-primary">Cast</span></h2>
                        </div>
                        <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition">
                            <FiX size={20} />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex gap-4 items-center animate-pulse">
                                        <div className="w-12 h-12 rounded-full bg-white/5" />
                                        <div className="flex-grow space-y-2">
                                            <div className="h-3 w-1/2 bg-white/5 rounded" />
                                            <div className="h-2 w-1/3 bg-white/5 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cast.map((member) => (
                                    <motion.div
                                        key={member.id}
                                        whileHover={{ x: 5 }}
                                        className="flex gap-4 items-center group cursor-pointer"
                                    >
                                        <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden shrink-0 group-hover:border-primary transition">
                                            <img
                                                src={resizeImage(member.profile_path || "", "w138_and_h175_face")}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                alt={member.name}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-white text-sm font-bold truncate group-hover:text-primary transition">{member.name}</h4>
                                            <p className="text-gray-500 text-[10px] uppercase font-black truncate">{member.character}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-primary/10 border-t border-white/5">
                        <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-tighter">Instant Identity Powered by StreamLux Vision AI</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VisionCastOverlay;
