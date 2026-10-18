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

    const loadCatalog = (providerVal: string) => {
        setIsLoading(true);
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
            setHeroPost(null);
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
            {/* Provider Banner & Switcher Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-[#FF6B35]/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,107,53,0.2)]">
                        {activeProvider.icon ? (
                            <img
                                src={activeProvider.icon}
                                alt={activeProvider.display_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) parent.innerHTML = '<span class="text-base text-[#FF6B35] font-black">⚡</span>';
                                }}
                            />
                        ) : (
                            <MdBolt size={24} className="text-[#FF6B35]" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6B35]">
                                Active Engine
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF6B35]/20 text-[#FF6B35] font-mono font-bold">
                                {activeProvider.version ? `v${activeProvider.version}` : 'Native'}
                            </span>
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            {activeProvider.display_name}
                        </h1>
                        <p className="text-xs text-gray-400">
                            Direct ad-free streaming • Powered by Vega Multi-Provider Core
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                    <ProviderSelector />
                    <button
                        onClick={() => loadCatalog(activeProvider.value)}
                        className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        title="Reload Catalog"
                    >
                        <MdRefresh size={18} />
                    </button>
                </div>
            </div>

            {/* Dynamic Hero Spotlight Banner */}
            {heroPost && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full rounded-3xl overflow-hidden bg-[#0c0d14] border border-white/10 shadow-2xl h-[320px] md:h-[420px] flex items-end"
                >
                    {/* Background Hero Image */}
                    <img
                        src={heroPost.image}
                        alt={heroPost.title}
                        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.45] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                    {/* Content Overlay */}
                    <div className="relative z-10 p-6 md:p-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B35] text-black text-[10px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,107,53,0.6)]">
                                ⚡ Spotlight
                            </span>
                            {heroPost.tag && (
                                <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-bold text-white border border-white/15">
                                    {heroPost.tag}
                                </span>
                            )}
                            <span className="text-[11px] text-gray-400 font-medium">
                                via {activeProvider.display_name}
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-md">
                            {heroPost.title}
                        </h2>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleWatchHero}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6B35] hover:bg-[#ff7b4b] text-black font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(255,107,53,0.5)] hover:scale-105 active:scale-95"
                            >
                                <MdPlayArrow size={22} className="fill-current" />
                                <span>Watch Now</span>
                            </button>

                            <button
                                onClick={handleWatchHero}
                                className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs md:text-sm uppercase tracking-wider transition-all duration-300 backdrop-blur-md"
                            >
                                <MdInfoOutline size={18} />
                                <span>Details</span>
                            </button>
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
                    catalogRows.map((row, idx) => (
                        <ProviderRowSlider
                            key={`${activeProvider.value}-${row.filter || idx}`}
                            title={row.title}
                            filter={row.filter}
                            providerValue={activeProvider.value}
                            onFirstItemLoaded={idx === 0 && !heroPost ? (post) => setHeroPost(post) : undefined}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ProviderHomeContent;
