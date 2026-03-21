/**
 * WatchedFolderSection.tsx
 *
 * Plex-style "Watched Folder" UI for the Downloads page.
 * - First time: shows a "Set Download Folder" button
 * - After folder is picked: auto-scans on every page open
 * - Movies shown as a poster grid
 * - TV Shows grouped by series → clicking a show poster expands episode list
 */

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdFolderOpen, MdPlayArrow, MdDelete, MdRefresh,
    MdStar, MdChevronRight, MdChevronLeft, MdClose, MdTv, MdLocalMovies,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setSource } from '../../store/slice/movieSlice';
import {
    watchedFolderService,
    WatchedFile,
    WatchedTVShow,
} from '../../services/watchedFolderService';
import { toast } from 'react-toastify';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w780';
const STILL_BASE = 'https://image.tmdb.org/t/p/w300';
const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400';
const FALLBACK_STILL = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300';

interface Props {
    onCountChange?: (count: number) => void;
}

const WatchedFolderSection: FC<Props> = ({ onCountChange }) => {
    const [movies, setMovies] = useState<WatchedFile[]>([]);
    const [tvShows, setTvShows] = useState<WatchedTVShow[]>([]);
    const [selectedShow, setSelectedShow] = useState<WatchedTVShow | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [folderInfo, setFolderInfo] = useState(watchedFolderService.getFolderInfo());
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    /* ── Auto-refresh on mount ────────────────────────────────────────── */
    useEffect(() => {
        refresh();
    }, []);

    const refresh = () => {
        const { movies, tvShows } = watchedFolderService.getGrouped();
        setMovies(movies);
        setTvShows(tvShows);
        setFolderInfo(watchedFolderService.getFolderInfo());
        onCountChange?.(movies.length + tvShows.reduce((a, s) => a + s.episodes.length, 0));
    };

    /* ── Folder picker ────────────────────────────────────────────────── */
    const handlePickFolder = async () => {
        setIsScanning(true);
        toast.info('Opening folder browser — select your downloads folder…', { position: 'top-center', autoClose: 3000 });
        try {
            const newCount = await watchedFolderService.pickFolderAndScan();
            refresh();
            if (newCount > 0) {
                toast.success(`Found ${newCount} new video${newCount > 1 ? 's' : ''} — matched with TMDB!`, { position: 'top-center' });
            } else {
                toast.info('No new videos found in that folder.', { position: 'top-center' });
            }
        } catch {
            toast.error('Could not read the folder. Please try again.', { position: 'top-center' });
        } finally {
            setIsScanning(false);
        }
    };

    /* ── Rescan (repick same folder) ──────────────────────────────────── */
    const handleRescan = () => handlePickFolder();

    /* ── Play a file ──────────────────────────────────────────────────── */
    const playFile = (file: WatchedFile) => {
        if (!file.localUrl) {
            toast.warn('Video link expired. Please re-scan your folder to refresh it.', { position: 'top-center' });
            return;
        }
        dispatch(setSource(file.localUrl));
        navigate('/watch');
    };

    /* ── Remove file ──────────────────────────────────────────────────── */
    const removeFile = (id: string) => {
        watchedFolderService.removeFile(id);
        refresh();
        if (selectedShow) {
            const updated = watchedFolderService.getGrouped().tvShows.find(s => s.tmdbId === selectedShow.tmdbId);
            setSelectedShow(updated || null);
        }
    };

    const hasContent = movies.length > 0 || tvShows.length > 0;

    return (
        <div className="mt-10 space-y-10">
            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <MdFolderOpen className="text-emerald-400" size={28} />
                        My <span className="text-emerald-400">Media Folder</span>
                    </h2>
                    {folderInfo ? (
                        <p className="text-gray-500 text-sm mt-1">
                            Watching: <span className="text-emerald-400 font-bold">/{folderInfo.folderName}</span>
                            <span className="ml-3 text-gray-600">• Auto-matched with TMDB</span>
                        </p>
                    ) : (
                        <p className="text-gray-500 text-sm mt-1">Pick your downloads folder to get started</p>
                    )}
                </div>
                <div className="flex gap-2">
                    {hasContent && (
                        <button
                            onClick={handleRescan}
                            disabled={isScanning}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition disabled:opacity-40"
                        >
                            <MdRefresh size={16} className={isScanning ? 'animate-spin' : ''} />
                            {isScanning ? 'Scanning…' : 'Rescan'}
                        </button>
                    )}
                    <button
                        onClick={handlePickFolder}
                        disabled={isScanning}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 disabled:opacity-40 active:scale-95"
                    >
                        {isScanning ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <MdFolderOpen size={16} />
                        )}
                        {folderInfo ? 'Change Folder' : 'Set Download Folder'}
                    </button>
                </div>
            </div>

            {/* ── Empty state ── */}
            {!hasContent && !isScanning && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white/3 rounded-[3rem] border border-dashed border-white/10">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                        <MdFolderOpen size={36} className="text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase">No videos yet</h3>
                    <p className="text-gray-500 max-w-xs mt-2 text-sm">
                        Tap "Set Download Folder" and select the folder where your downloaded movies and episodes are saved.
                        StreamLux will match them with TMDB automatically!
                    </p>
                </div>
            )}

            {/* ── TV Shows ── */}
            {tvShows.length > 0 && (
                <section>
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MdTv size={14} className="text-emerald-400" /> TV Shows ({tvShows.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {tvShows.map(show => (
                            <motion.div
                                key={show.tmdbId}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative rounded-3xl overflow-hidden border border-white/5 hover:border-emerald-400/40 cursor-pointer transition-all duration-500 shadow-xl"
                                onClick={() => setSelectedShow(show)}
                            >
                                <div className="aspect-[2/3] relative">
                                    <img
                                        src={show.posterPath ? `${POSTER_BASE}${show.posterPath}` : FALLBACK_POSTER}
                                        alt={show.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-white text-xs font-black uppercase tracking-tight line-clamp-2">{show.title}</p>
                                        <p className="text-emerald-400 text-[10px] font-bold mt-0.5">
                                            {show.episodes.length} episode{show.episodes.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-emerald-500/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                                        <span className="text-[9px] font-black text-white uppercase tracking-wider">TV</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── Movies ── */}
            {movies.length > 0 && (
                <section>
                    <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MdLocalMovies size={14} className="text-primary" /> Movies ({movies.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {movies.map(file => (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative rounded-3xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-500 shadow-xl"
                            >
                                <div className="aspect-[2/3] relative cursor-pointer" onClick={() => playFile(file)}>
                                    <img
                                        src={file.posterPath ? `${POSTER_BASE}${file.posterPath}` : FALLBACK_POSTER}
                                        alt={file.title || file.filename}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    {/* Play overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 backdrop-blur-[2px]">
                                        <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl">
                                            <MdPlayArrow size={32} />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-white text-xs font-black uppercase tracking-tight line-clamp-2">{file.title || file.filename}</p>
                                        {file.voteAverage && (
                                            <p className="text-yellow-400 text-[10px] flex items-center gap-0.5 mt-0.5">
                                                <MdStar size={10} /> {file.voteAverage.toFixed(1)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Delete */}
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="absolute top-3 right-3 p-2 rounded-2xl bg-black/60 border border-white/10 text-white/40 hover:text-red-500 transition z-10"
                                >
                                    <MdDelete size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── TV Show Episode Modal ── */}
            <AnimatePresence>
                {selectedShow && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto"
                    >
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            className="min-h-screen max-w-3xl mx-auto px-4 py-8"
                        >
                            {/* Show backdrop */}
                            {selectedShow.backdropPath && (
                                <div className="relative rounded-3xl overflow-hidden mb-6 aspect-video">
                                    <img
                                        src={`${BACKDROP_BASE}${selectedShow.backdropPath}`}
                                        alt={selectedShow.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-6">
                                        <h2 className="text-3xl font-black text-white uppercase">{selectedShow.title}</h2>
                                        <p className="text-sm text-gray-300 mt-1 line-clamp-2">{selectedShow.overview}</p>
                                    </div>
                                </div>
                            )}
                            {!selectedShow.backdropPath && (
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-black text-white uppercase">{selectedShow.title}</h2>
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={() => setSelectedShow(null)}
                                className="fixed top-6 right-6 p-3 rounded-full bg-black/60 border border-white/10 text-white hover:text-red-400 transition z-50"
                            >
                                <MdClose size={22} />
                            </button>

                            {/* Episodes list */}
                            <div className="space-y-3">
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
                                    {selectedShow.episodes.length} Episode{selectedShow.episodes.length !== 1 ? 's' : ''} on device
                                </p>
                                {selectedShow.episodes.map(ep => (
                                    <motion.div
                                        key={ep.id}
                                        layout
                                        className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-emerald-400/30 transition group cursor-pointer"
                                        onClick={() => playFile(ep)}
                                    >
                                        {/* Still / thumbnail */}
                                        <div className="relative flex-shrink-0 w-28 h-16 rounded-xl overflow-hidden">
                                            <img
                                                src={ep.episodeStillPath ? `${STILL_BASE}${ep.episodeStillPath}` : FALLBACK_STILL}
                                                alt={ep.episodeTitle || ep.filename}
                                                className="w-full h-full object-cover group-hover:scale-105 transition"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                                                <MdPlayArrow size={24} className="text-white" />
                                            </div>
                                        </div>

                                        {/* Episode info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] text-emerald-400 font-black uppercase tracking-widest">
                                                S{String(ep.seasonNumber).padStart(2, '0')} · E{String(ep.episodeNumber).padStart(2, '0')}
                                            </p>
                                            <p className="text-white text-sm font-bold mt-0.5 line-clamp-1">
                                                {ep.episodeTitle || ep.filename}
                                            </p>
                                            <p className="text-gray-600 text-[10px] mt-1 truncate">{ep.filename}</p>
                                        </div>

                                        {/* Delete */}
                                        <button
                                            onClick={e => { e.stopPropagation(); removeFile(ep.id); }}
                                            className="p-2 rounded-xl text-white/20 hover:text-red-500 transition ml-auto flex-shrink-0"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WatchedFolderSection;
