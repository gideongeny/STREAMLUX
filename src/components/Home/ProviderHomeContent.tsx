import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MdBolt, MdPlayArrow, MdInfoOutline, MdRefresh } from 'react-icons/md';
import { providerCatalog, CatalogRow, ProviderPost } from '../../services/providers/providerCatalog';
import { ProviderExtension } from '../../services/providers/types';
import ProviderRowSlider from './ProviderRowSlider';
import ProviderSelector from '../Navigation/ProviderSelector';

interface ProviderHomeContentProps {
    className?: string;
}

const ProviderHomeContent: React.FC<ProviderHomeContentProps> = ({ className = '' }) => {
    const navigate = useNavigate();
    const [activeProvider, setActiveProvider] = useState<ProviderExtension>(() => providerCatalog.getActiveProvider());
    const [catalogRows, setCatalogRows] = useState<CatalogRow[]>([]);
    const [heroPost, setHeroPost] = useState<ProviderPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [postsCounts, setPostsCounts] = useState<Record<string, number>>({});

    const loadCatalog = (providerVal: string) => {
        setIsLoading(true);
        setPostsCounts({});
        setHeroPost(null);
        providerCatalog.getCatalog(providerVal).then((rows) => {
            setCatalogRows(rows && rows.length > 0 ? rows : [{ title: 'Featured Content', filter: '' }]);
            setIsLoading(false);
        }).catch(() => {
            setCatalogRows([{ title: 'Featured Content', filter: '' }]);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        loadCatalog(activeProvider.value);

        const handleProviderChange = (e: any) => {
            const newProvider = e.detail || providerCatalog.getActiveProvider();
            setActiveProvider(newProvider);
            loadCatalog(newProvider.value);
        };

        window.addEventListener('streamlux:provider-changed', handleProviderChange);
        return () => window.removeEventListener('streamlux:provider-changed', handleProviderChange);
    }, [activeProvider.value]);

    const handleWatchHero = () => {
        if (!heroPost) return;
        navigate(`/provider/info?link=${encodeURIComponent(heroPost.link)}&title=${encodeURIComponent(heroPost.title)}&provider=${encodeURIComponent(activeProvider.value)}&image=${encodeURIComponent(heroPost.image)}`);
    };

    return (
        <div className={`space-y-8 ${className}`}>
            {/* Dynamic Hero Spotlight Banner with Full Poster Display */}
            {heroPost && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full rounded-3xl overflow-hidden bg-[#0a0b10] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] min-h-[360px] md:min-h-[460px] flex items-center p-6 sm:p-8 md:p-12 mt-2"
                >
                    {/* Ambient Background Glow from the poster */}
                    <div
                        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 scale-125"
                        style={{ backgroundImage: `url(${heroPost.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-transparent" />

                    {/* Content flex: Left has full uncropped poster, right has metadata & actions */}
                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end md:items-center gap-6 md:gap-10 w-full">
                        {/* FULL ACTUAL POSTER CARD */}
                        <div className="shrink-0 w-36 sm:w-48 md:w-60 aspect-[2/3] rounded-2xl overflow-hidden bg-black/60 border border-white/15 shadow-[0_0_35px_rgba(255,107,53,0.25)] group relative">
                            <img
                                src={heroPost.image}
                                alt={heroPost.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {heroPost.tag && (
                                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-bold text-yellow-400 flex items-center gap-1 shadow-lg">
                                    <span>★</span>
                                    <span>{heroPost.tag}</span>
                                </div>
                            )}
                        </div>

                        {/* Title, tags, description & buttons */}
                        <div className="flex-1 min-w-0 text-center sm:text-left space-y-3 md:space-y-4">
                            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                <span className="px-3 py-1 rounded-full bg-[#FF6B35] text-black text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,107,53,0.5)]">
                                    ⚡ Spotlight
                                </span>
                                <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                                    via {activeProvider.display_name}
                                </span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                                {heroPost.title}
                            </h2>

                            <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 max-w-xl">
                                Stream now in native ad-free direct quality with multiserver streams and high-speed downloads on StreamLux.
                            </p>

                            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                                <button
                                    onClick={handleWatchHero}
                                    className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#FF6B35] hover:bg-[#ff7b4b] text-black font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(255,107,53,0.5)] hover:scale-105 active:scale-95"
                                >
                                    <MdPlayArrow size={22} className="fill-current" />
                                    <span>Watch Now</span>
                                </button>

                                <button
                                    onClick={handleWatchHero}
                                    className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 backdrop-blur-md hover:scale-105 active:scale-95"
                                >
                                    <MdInfoOutline size={18} />
                                    <span>Details</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Catalog Rows */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="h-5 w-40 bg-white/5 rounded-md animate-pulse" />
                                <div className="flex gap-4">
                                    {Array.from({ length: 5 }).map((_, j) => (
                                        <div key={j} className="w-[170px] aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {catalogRows.map((row, idx) => (
                            <ProviderRowSlider
                                key={`${activeProvider.value}-${row.filter || idx}`}
                                title={row.title}
                                filter={row.filter}
                                providerValue={activeProvider.value}
                                onFirstItemLoaded={idx === 0 && !heroPost ? (post) => setHeroPost(post) : undefined}
                                onItemsLoaded={(count) => {
                                    setPostsCounts((prev) => ({ ...prev, [row.filter || String(idx)]: count }));
                                }}
                            />
                        ))}

                        {/* Fallback card if provider has 0 titles in its current catalog */}
                        {Object.keys(postsCounts).length >= catalogRows.length &&
                         Object.values(postsCounts).reduce((a, b) => a + b, 0) === 0 &&
                         catalogRows.length > 0 && (
                            <div className="py-16 px-6 text-center rounded-2xl bg-white/[0.02] border border-white/5 my-6 flex flex-col items-center justify-center max-w-xl mx-auto shadow-2xl">
                                <div className="w-12 h-12 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] flex items-center justify-center mb-4">
                                    <MdBolt size={24} />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2">Connecting to {activeProvider.display_name}...</h3>
                                <p className="text-xs text-gray-400 mb-6 max-w-md">
                                    This provider is currently synchronizing its catalog. You can reload or choose from 35 other high-speed direct engines like MultiStream, MoviesDrive, or Vega.
                                </p>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => loadCatalog(activeProvider.value)}
                                        className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                                    >
                                        <MdRefresh size={16} />
                                        <span>Retry</span>
                                    </button>
                                    <ProviderSelector />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProviderHomeContent;
