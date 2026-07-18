/**
 * WatchedFolderSection.tsx — Persistent Video Library for StreamLux
 *
 * Uses deviceFilePicker which copies videos to app-private Directory.Data
 * and gives persistent capacitor:// URIs (no more 404 on navigation).
 *
 * - User picks one or multiple videos from gallery / file manager
 * - Each is copied to internal storage (persistent across sessions)
 * - TMDB is searched for poster art + episode info
 * - TV shows grouped by series title; movies displayed individually
 * - Tap a TV series poster → episode list modal
 */

import { FC, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdVideoLibrary, MdPlayArrow, MdDelete,
    MdClose, MdTv, MdLocalMovies, MdAddCircle, MdStar,
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store/hooks';
import { setSource } from '../../store/slice/movieSlice';
import { deviceFilePicker, ImportedVideoFile } from '../../services/deviceFilePicker';
import { toast } from 'react-toastify';

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400';
const FALLBACK_STILL = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300';

interface TVGroup {
    title: string;
    thumbnail?: string;
    episodes: ImportedVideoFile[];
}

const WatchedFolderSection: FC = () => {
    const [movies, setMovies] = useState<ImportedVideoFile[]>([]);
    const [tvGroups, setTVGroups] = useState<TVGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<TVGroup | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => { refresh(); }, []);

    const refresh = () => {
        const { movies, tvGroups } = deviceFilePicker.getGrouped();
        setMovies(movies);
        // Convert Map to array of TVGroup objects
        const groups: TVGroup[] = [];
        tvGroups.forEach((eps, title) => {
            groups.push({ title, thumbnail: eps[0]?.thumbnail, episodes: eps });
        });
        setTVGroups(groups);
    };

    const handleAddVideos = async () => {
        setIsImporting(true);
        setImportProgress({ done: 0, total: 0 });
        toast.info('Select one or more videos from your device…', { position: 'top-center', autoClose: 2500 });

        try {
            const added = await deviceFilePicker.pickAndImport((done, total) => {
                setImportProgress({ done, total });
            });

            refresh();

            if (added.length > 0) {
                toast.success(
                    `✅ ${added.length} video${added.length > 1 ? 's' : ''} added — matched with TMDB!`,
                    { position: 'top-center' }
                );
            } else {
                toast.info('No new videos were added.', { position: 'top-center' });
            }
        } catch {
            toast.error('Could not import videos. Please try again.', { position: 'top-center' });
        } finally {
            setIsImporting(false);
        }
    };

    const playFile = (file: ImportedVideoFile) => {
        if (!file.localUrl) {
            toast.warn('File URL missing — try re-importing this video.', { position: 'top-center' });
            return;
        }
        dispatch(setSource(file.localUrl));
        navigate('/watch');
    };

    const removeFile = async (id: string) => {
        await deviceFilePicker.remove(id);
        refresh();
        if (selectedGroup) {
            const updated = selectedGroup.episodes.filter(e => e.id !== id);
            if (updated.length === 0) setSelectedGroup(null);
            else setSelectedGroup({ ...selectedGroup, episodes: updated });
        }
    };

    const totalCount = movies.length + tvGroups.reduce((a, g) => a + g.episodes.length, 0);
    const hasContent = totalCount > 0;

    return (
        <div className="mt-10">
            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <MdVideoLibrary className="text-violet-400" size={26} />
                        My <span className="text-violet-400">Videos</span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {hasContent
                            ? `${totalCount} video${totalCount !== 1 ? 's' : ''} — stored in app, playable offline`
                            : 'Pick videos from your device gallery or downloads folder'}
                    </p>
                </div>

                <button
                    onClick={handleAddVideos}
                    disabled={isImporting}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-500 text-white text-xs font-black uppercase tracking-widest hover:bg-violet-400 transition shadow-lg shadow-violet-500/20 disabled:opacity-50 active:scale-95"
                >
                    {isImporting ? (
                        <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {importProgress.total > 0
                                ? `Copying ${importProgress.done + 1}/${importProgress.total}…`
                                : 'Opening…'}
                        </>
                    ) : (
                        <>
                            <MdAddCircle size={16} />
                            Add Videos
                        </>
                    )}
                </button>
            </div>

            {/* ── Empty state ── */}
            {!hasContent && !isImporting && (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white/3 rounded-[3rem] border border-dashed border-white/10">
                    <div className="w-20 h-20 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                        <MdVideoLibrary size={36} className="text-violet-400" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase">No videos yet</h3>
                    <p className="text-gray-500 max-w-xs mt-2 text-sm leading-relaxed">
                        Tap <strong>"Add Videos"</strong> to pick movies or episodes from your gallery or downloads folder.
                        You can select multiple at once — they'll be stored in the app and playable without internet!
                    </p>
                    <button
                        onClick={handleAddVideos}
                        disabled={isImporting}
                        className="mt-6 px-8 py-3 bg-violet-500 text-white rounded-full font-black uppercase tracking-widest text-sm hover:bg-violet-400 transition"
                    >
                        Add Videos
                    </button>
                </div>
            )}

            {/* ── TV Shows ── */}
            {tvGroups.length > 0 && (
                <section className="mb-10">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MdTv size={13} className="text-violet-400" /> TV Shows ({tvGroups.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {tvGroups.map(group => (
                            <motion.div
                                key={group.title}
                                layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                className="group relative rounded-3xl overflow-hidden border border-white/5 hover:border-violet-400/40 cursor-pointer transition-all duration-500 shadow-xl"
                                onClick={() => setSelectedGroup(group)}
                            >
                                <div className="aspect-[2/3] relative">
                                    <img
                                        src={group.thumbnail || FALLBACK_POSTER}
                                        alt={group.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-white text-xs font-black uppercase tracking-tight line-clamp-2">{group.title}</p>
                                        <p className="text-violet-400 text-[10px] font-bold mt-0.5">
                                            {group.episodes.length} episode{group.episodes.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="absolute top-3 right-3 bg-violet-500/80 backdrop-blur-sm rounded-full px-2 py-0.5">
                                        <span className="text-[9px] font-black text-white uppercase">TV</span>
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
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MdLocalMovies size={13} className="text-primary" /> Movies ({movies.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {movies.map(file => (
                            <motion.div
                                key={file.id}
                                layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                className="group relative rounded-3xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-500 shadow-xl"
                            >
                                <div className="aspect-[2/3] relative cursor-pointer" onClick={() => playFile(file)}>
                                    <img
                                        src={file.thumbnail || FALLBACK_POSTER}
                                        alt={file.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 backdrop-blur-[2px]">
                                        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-2xl">
                                            <MdPlayArrow size={32} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-white text-xs font-black uppercase tracking-tight line-clamp-2">{file.title}</p>
                                        {file.voteAverage && (
                                            <p className="text-yellow-400 text-[10px] flex items-center gap-0.5 mt-0.5">
                                                <MdStar size={10} /> {file.voteAverage.toFixed(1)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="absolute top-3 right-3 p-2 rounded-2xl bg-black/60 border border-white/10 text-white/30 hover:text-red-500 transition z-10"
                                >
                                    <MdDelete size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── TV Show episode modal ── */}
            <AnimatePresence>
                {selectedGroup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto"
                    >
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            className="min-h-screen max-w-2xl mx-auto px-4 py-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase">{selectedGroup.title}</h2>
                                    <p className="text-violet-400 text-sm font-bold">{selectedGroup.episodes.length} Episodes</p>
                                </div>
                                <button onClick={() => setSelectedGroup(null)} className="p-3 rounded-full bg-white/10 text-white hover:text-red-400 transition">
                                    <MdClose size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {selectedGroup.episodes.map(ep => (
                                    <motion.div
                                        key={ep.id}
                                        className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/5 hover:border-violet-400/30 transition cursor-pointer group"
                                        onClick={() => playFile(ep)}
                                    >
                                        <div className="relative flex-shrink-0 w-24 h-14 rounded-xl overflow-hidden bg-black/40">
                                            <img
                                                src={ep.thumbnail || FALLBACK_STILL}
                                                alt={ep.episodeTitle || ep.originalName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                                                <MdPlayArrow size={22} className="text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {ep.seasonNumber && (
                                                <p className="text-[10px] text-violet-400 font-black uppercase tracking-widest">
                                                    S{String(ep.seasonNumber).padStart(2, '0')} · E{String(ep.episodeNumber).padStart(2, '0')}
                                                </p>
                                            )}
                                            <p className="text-white text-sm font-bold mt-0.5 line-clamp-1">
                                                {ep.episodeTitle || ep.originalName}
                                            </p>
                                            <p className="text-gray-600 text-[9px] mt-0.5 truncate">{ep.originalName}</p>
                                        </div>
                                        <button
                                            onClick={e => { e.stopPropagation(); removeFile(ep.id); }}
                                            className="p-2 rounded-xl text-white/20 hover:text-red-500 transition flex-shrink-0"
                                        >
                                            <MdDelete size={16} />
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
