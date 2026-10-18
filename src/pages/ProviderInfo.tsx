import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdBolt, MdPlayArrow, MdArrowBack, MdDownload, MdStar, MdLocalMovies, MdTv } from 'react-icons/md';
import { providerCatalog, ProviderMeta } from '../services/providers/providerCatalog';
import SEO from '../components/Common/SEO';
import TopSearchBar from '../components/Common/TopSearchBar';
import Footer from '../components/Footer/Footer';
import ProviderSelector from '../components/Navigation/ProviderSelector';

const ProviderInfo: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const link = searchParams.get('link') || '';
    const titleParam = searchParams.get('title') || '';
    const providerParam = searchParams.get('provider') || providerCatalog.getActiveProvider().value;
    const initialImage = searchParams.get('image') || '';

    const [meta, setMeta] = useState<ProviderMeta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);

    useEffect(() => {
        if (!link) return;
        setIsLoading(true);

        providerCatalog.getMeta(link, providerParam).then((res) => {
            setMeta(res);
            setIsLoading(false);
        }).catch((err) => {
            console.error('Failed to load provider meta:', err);
            setIsLoading(false);
        });
    }, [link, providerParam]);

    const displayTitle = meta?.title || titleParam || 'Stream Title';
    const displayPoster = meta?.poster || initialImage || meta?.image || '/logo.svg';
    const displayBackdrop = meta?.image || displayPoster;

    const isSeries = meta?.type === 'series' || (meta?.linkList && meta.linkList.length > 1);
    const currentSeason = meta?.linkList?.[selectedSeasonIdx] || meta?.linkList?.[0];

    const handlePlayMovie = () => {
        const playLink = meta?.linkList?.[0]?.directLinks?.[0]?.link || link;
        navigate(`/provider/watch?link=${encodeURIComponent(playLink)}&title=${encodeURIComponent(displayTitle)}&provider=${encodeURIComponent(providerParam)}&type=movie&poster=${encodeURIComponent(displayPoster)}`);
    };

    const handlePlayEpisode = (epLink: string, epTitle: string) => {
        navigate(`/provider/watch?link=${encodeURIComponent(epLink)}&title=${encodeURIComponent(`${displayTitle} - ${epTitle}`)}&provider=${encodeURIComponent(providerParam)}&type=tv&poster=${encodeURIComponent(displayPoster)}`);
    };

    return (
        <div className="min-h-screen bg-[#07080d] text-white flex flex-col">
            <SEO title={`${displayTitle} | StreamLux`} description={meta?.synopsis || 'Watch ad-free on StreamLux'} />
            <TopSearchBar />

            {/* Hero Backdrop Banner */}
            <div className="relative w-full h-[360px] md:h-[500px] overflow-hidden">
                <img
                    src={displayBackdrop}
                    alt={displayTitle}
                    className="w-full h-full object-cover object-center filter brightness-[0.35] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07080d] via-transparent to-transparent" />

                <div className="absolute top-20 left-4 md:left-12 z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-gray-300 hover:text-white hover:border-[#FF6B35]/50 transition-all"
                    >
                        <MdArrowBack size={16} />
                        <span>Back</span>
                    </button>
                </div>
            </div>

            {/* Main Content Info Container */}
            <main className="flex-1 max-w-7xl mx-auto px-4 md:px-12 -mt-44 md:-mt-64 relative z-10 w-full pb-16">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Poster Card */}
                    <div className="shrink-0 w-44 md:w-64 rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] mx-auto md:mx-0">
                        <img
                            src={displayPoster}
                            alt={displayTitle}
                            className="w-full aspect-[2/3] object-cover"
                            onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                        />
                    </div>

                    {/* Metadata Section */}
                    <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <MdBolt size={13} />
                                {providerParam}
                            </span>

                            {meta?.rating && (
                                <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold flex items-center gap-1">
                                    <MdStar size={13} />
                                    {meta.rating}
                                </span>
                            )}

                            {meta?.year && (
                                <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] font-mono">
                                    {meta.year}
                                </span>
                            )}

                            <span className="px-2.5 py-1 rounded-full bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                {isSeries ? <MdTv size={12} /> : <MdLocalMovies size={12} />}
                                {isSeries ? 'Series' : 'Movie'}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
                            {displayTitle}
                        </h1>

                        {/* Action Buttons for Movie */}
                        {!isSeries && (
                            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                <button
                                    onClick={handlePlayMovie}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#FF6B35] hover:bg-[#ff7b4b] text-black font-black text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(255,107,53,0.5)] hover:scale-105 active:scale-95"
                                >
                                    <MdPlayArrow size={24} className="fill-current" />
                                    <span>Watch Movie</span>
                                </button>
                            </div>
                        )}

                        {/* Synopsis */}
                        {meta?.synopsis && (
                            <div className="pt-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-1">
                                    Synopsis
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
                                    {meta.synopsis}
                                </p>
                            </div>
                        )}

                        {/* Tags / Genres */}
                        {meta?.tags && meta.tags.length > 0 && (
                            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap pt-2">
                                {meta.tags.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[11px] text-gray-400">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Cast */}
                        {meta?.cast && meta.cast.length > 0 && (
                            <div className="pt-2">
                                <span className="text-xs text-gray-400 font-bold">Cast: </span>
                                <span className="text-xs text-gray-300">{meta.cast.slice(0, 8).join(', ')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Series Episodes & Seasons Section */}
                {isSeries && meta?.linkList && meta.linkList.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-white/10 space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h2 className="text-lg md:text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                                    <MdTv className="text-[#FF6B35]" />
                                    Seasons & Episodes
                                </h2>
                                <p className="text-xs text-gray-400">Select an episode to start ad-free direct playback</p>
                            </div>

                            {/* Season Selector Tabs */}
                            {meta.linkList.length > 1 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                                    {meta.linkList.map((season, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedSeasonIdx(idx)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                                selectedSeasonIdx === idx
                                                    ? 'bg-[#FF6B35] text-black font-black shadow-[0_0_15px_rgba(255,107,53,0.4)]'
                                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            {season.title || `Season ${idx + 1}`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Episodes Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {(currentSeason?.directLinks || []).map((ep, epIdx) => (
                                <button
                                    key={epIdx}
                                    onClick={() => handlePlayEpisode(ep.link, ep.title || `Episode ${epIdx + 1}`)}
                                    className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] hover:bg-[#FF6B35]/15 border border-white/5 hover:border-[#FF6B35]/40 transition-all duration-300 text-left group shadow-sm hover:shadow-[0_0_20px_rgba(255,107,53,0.2)]"
                                >
                                    <div className="min-w-0 pr-3">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B35] block">
                                            {ep.type || 'HD'}
                                        </span>
                                        <h4 className="text-xs font-bold text-white group-hover:text-[#FF6B35] transition-colors truncate">
                                            {ep.title || `Episode ${epIdx + 1}`}
                                        </h4>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#FF6B35] group-hover:text-black flex items-center justify-center text-white shrink-0 transition-colors">
                                        <MdPlayArrow size={18} className="fill-current ml-0.5" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default ProviderInfo;
