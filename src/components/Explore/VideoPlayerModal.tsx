import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerModalProps {
    videoId: string;
    onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ videoId, onClose }) => {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                >
                    {/* Header/Close Button */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-10 bg-gradient-to-b from-black/60 to-transparent">
                        <button
                            onClick={onClose}
                            className="p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* YouTube Embed with Ad Blocking Sandbox */}
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                        title="YouTube video player"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        // Restricted sandbox to block ad-tech and external popups
                        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                    ></iframe>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default VideoPlayerModal;
