import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProviderPost } from '../../services/providers/providerCatalog';
import { MdBolt } from 'react-icons/md';

interface ProviderPostCardProps {
    post: ProviderPost;
    providerValue: string;
}

const ProviderPostCard: React.FC<ProviderPostCardProps> = ({ post, providerValue }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // Navigate to provider info/watch page
        navigate(`/provider/info?link=${encodeURIComponent(post.link)}&title=${encodeURIComponent(post.title)}&provider=${encodeURIComponent(providerValue)}&image=${encodeURIComponent(post.image)}`);
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={handleClick}
            className="group relative cursor-pointer flex flex-col shrink-0 w-[140px] sm:w-[170px] md:w-[190px] select-none"
        >
            {/* Poster container */}
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#12131a] border border-white/5 group-hover:border-[#FF6B35]/50 group-hover:shadow-[0_0_25px_rgba(255,107,53,0.3)] transition-all duration-300">
                <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        e.currentTarget.src = '/logo.svg';
                        e.currentTarget.className = 'w-full h-full object-contain p-8 opacity-40';
                    }}
                />

                {/* Dark gradient on hover/bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                {/* Tag/Quality badge */}
                {post.tag && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[9px] font-black text-[#FF6B35] tracking-wider uppercase shadow-md">
                        {post.tag}
                    </div>
                )}

                {/* Provider Pill */}
                <div className="absolute top-2 right-2 p-1 rounded-md bg-[#FF6B35]/90 text-white text-[9px] font-black flex items-center justify-center shadow-lg">
                    <MdBolt size={11} />
                </div>

                {/* Play button overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-11 h-11 rounded-full bg-[#FF6B35] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,107,53,0.8)] scale-75 group-hover:scale-100 transition-transform">
                        <svg className="w-5 h-5 ml-0.5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Title & metadata */}
            <div className="mt-2.5 px-0.5">
                <h3 className="text-xs font-bold text-white group-hover:text-[#FF6B35] transition-colors line-clamp-1 leading-snug">
                    {post.title}
                </h3>
                <span className="text-[10px] text-gray-500 font-medium capitalize">
                    {providerValue}
                </span>
            </div>
        </motion.div>
    );
};

export default ProviderPostCard;
