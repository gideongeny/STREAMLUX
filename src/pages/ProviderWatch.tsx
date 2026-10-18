import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdBolt, MdArrowBack, MdDownload, MdRefresh, MdErrorOutline } from 'react-icons/md';
import { providerCatalog } from '../services/providers/providerCatalog';
import { extensionManager } from '../services/providers/ExtensionManager';
import { StreamSource } from '../services/providers/types';
import StreamLuxPlayer, { VideoSource } from '../components/FilmWatch/StreamLuxPlayer';
import SEO from '../components/Common/SEO';
import TopSearchBar from '../components/Common/TopSearchBar';
import Footer from '../components/Footer/Footer';
import { downloadService } from '../services/download';
import { proxyUrl } from '../services/corsProxy';
import { toast } from 'react-toastify';

const ProviderWatch: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const link = searchParams.get('link') || '';
    const title = searchParams.get('title') || 'Video Playback';
    const provider = searchParams.get('provider') || providerCatalog.getActiveProvider().value;
    const mediaType = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
    const poster = searchParams.get('poster') || '';

    const [sources, setSources] = useState<VideoSource[]>([]);
    const [rawSources, setRawSources] = useState<StreamSource[]>([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const loadStreams = () => {
        if (!link) return;
        setIsLoading(true);
        setErrorMsg(null);

        providerCatalog.getStream(link, mediaType, provider).then(async (data) => {
            if (data && data.length > 0) {
                setRawSources(data);
                const mappedSources: VideoSource[] = data.map((s, idx) => ({
                    name: s.server || `Server ${idx + 1} (${s.quality || '1080p'})`,
                    url: s.link,
                    quality: s.quality || '1080p',
                    type: s.type === 'hls' || s.link.includes('.m3u8') ? 'hls' : 'direct',
                    subtitles: s.subtitles || [],
                    headers: s.headers,
                }));
                setSources(mappedSources);
                setSelectedIdx(0);
                setIsLoading(false);
                return;
            }

            // Fallback: search other providers for working streams
            try {
                const cleanTitle = title.split(' - ')[0].trim();
                const fallbackStreams = await extensionManager.resolveAllStreams({
                    title: cleanTitle,
                    mediaType,
                    season: 1,
                    episode: 1,
                });

                if (fallbackStreams && fallbackStreams.length > 0) {
                    setRawSources(fallbackStreams);
                    const mapped = fallbackStreams.map((s, idx) => ({
                        name: s.server || `Backup ${idx + 1} (${s.quality || '1080p'})`,
                        url: s.link,
                        quality: s.quality || '1080p',
                        type: s.type === 'hls' || s.link.includes('.m3u8') ? 'hls' : 'direct',
                        subtitles: s.subtitles || [],
                        headers: s.headers,
                    }));
                    setSources(mapped);
                    setSelectedIdx(0);
                    setIsLoading(false);
                    return;
                }
            } catch (fbErr) {
                console.warn('Fallback stream resolution error:', fbErr);
            }

            setErrorMsg('No direct streams returned by this provider. Try another server or provider.');
            setIsLoading(false);
        }).catch((err) => {
            console.error('Failed to extract stream:', err);
            setErrorMsg('Extraction error. Please try another provider.');
            setIsLoading(false);
        });
    };

    useEffect(() => {
        loadStreams();
    }, [link, provider, mediaType]);

    const currentSource = sources[selectedIdx];

    const handleDownload = () => {
        if (!currentSource?.url) {
            toast.error('No stream URL available to download');
            return;
        }

        const cleanTitle = title.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_') || 'streamlux_video';
        const filename = `${cleanTitle}.mp4`;

        let downloadUrl = currentSource.url;
        if (!downloadUrl.includes('/api/proxy')) {
            const referer = currentSource.headers?.['Referer'] || currentSource.headers?.['referer'] || '';
            downloadUrl = `${proxyUrl(downloadUrl)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}`;
        }
        downloadUrl += `${downloadUrl.includes('?') ? '&' : '?'}download=1&filename=${encodeURIComponent(filename)}`;

        toast.info(`Starting direct download: ${filename}`, { position: 'top-center' });

        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => a.remove(), 1000);
    };

    return (
        <div className="min-h-screen bg-[#06070a] text-white flex flex-col">
            <SEO title={`Watch: ${title} | StreamLux`} description={`Stream ${title} directly with zero ads`} />
            <TopSearchBar />

            <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 md:px-8 pt-20 md:pt-24 pb-16 space-y-6">
                {/* Header Navigation Bar */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                        >
                            <MdArrowBack size={20} />
                        </button>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#FF6B35] flex items-center gap-1">
                                <MdBolt size={12} />
                                {provider} • Direct Native Stream
                            </span>
                            <h1 className="text-base md:text-xl font-black text-white truncate max-w-xl">
                                {title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {currentSource?.url && (
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF6B35]/20 hover:bg-[#FF6B35]/30 border border-[#FF6B35]/40 text-[#FF6B35] text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,107,53,0.15)]"
                                title="Download Stream"
                            >
                                <MdDownload size={16} />
                                <span className="hidden sm:inline">Download</span>
                            </button>
                        )}
                        <button
                            onClick={loadStreams}
                            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                            title="Reload Stream"
                        >
                            <MdRefresh size={18} />
                        </button>
                    </div>
                </div>

                {/* Native Player Container */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-white/10 border-t-[#FF6B35] rounded-full animate-spin" />
                            <div className="text-center">
                                <p className="text-white font-bold text-sm">Extracting Ad-Free Streams...</p>
                                <p className="text-gray-500 text-xs mt-1">Connecting to {provider} native engine</p>
                            </div>
                        </div>
                    ) : errorMsg || sources.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-8 text-center space-y-4">
                            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
                                <MdErrorOutline size={30} />
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-white font-bold text-base mb-1">Stream Extraction Issue</h3>
                                <p className="text-gray-400 text-xs">{errorMsg || 'No playable streams found for this title.'}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={loadStreams}
                                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 rounded-xl bg-[#FF6B35] text-black font-black text-xs transition-colors"
                                >
                                    Choose Another Source
                                </button>
                            </div>
                        </div>
                    ) : (
                        <StreamLuxPlayer
                            key={`${currentSource.url}-${selectedIdx}`}
                            sources={sources}
                            poster={poster}
                            title={title}
                            selectedSourceIndex={selectedIdx}
                            onSourceIndexChange={(idx) => setSelectedIdx(idx)}
                        />
                    )}
                </div>

                {/* Available Stream Qualities & Servers */}
                {sources.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                <MdBolt className="text-[#FF6B35]" />
                                Direct Servers & Qualities ({sources.length})
                            </span>
                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">
                                ● Ad-Free Direct Stream
                            </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {sources.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedIdx(idx)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                        selectedIdx === idx
                                            ? 'bg-[#FF6B35] text-black font-black shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                                            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5'
                                    }`}
                                >
                                    <MdBolt size={14} className={selectedIdx === idx ? 'text-black' : 'text-[#FF6B35]'} />
                                    <span>{s.name}</span>
                                    <span className="text-[10px] opacity-75 font-mono">[{s.quality || 'HD'}]</span>
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

export default ProviderWatch;
