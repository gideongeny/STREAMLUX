import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { removeDownload } from "../store/slice/downloadSlice";
import { FaTrash, FaPlay, FaDownload, FaPause, FaFolderOpen } from "react-icons/fa";
import { AiOutlineInfoCircle, AiOutlineSetting } from "react-icons/ai";
import Title from "../components/Common/Title";
import { LazyLoadImage } from "react-lazy-load-image-component";

const Downloads: FC = () => {
    const downloads = useAppSelector((state) => state.download.downloads);
    const dispatch = useAppDispatch();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const downloadingCount = downloads.filter(d => d.status === 'downloading').length;

    return (
        <div className="min-h-screen bg-[#111] pt-24 px-[4vw] pb-20">
            <Title value="Download Manager | StreamLux" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                        <FaDownload className="text-primary text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl text-white font-bold tracking-tight">Manage Downloads</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            {downloads.length} items total • {downloadingCount} active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="p-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition"
                        title="Toggle View"
                    >
                        <FaFolderOpen size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition font-medium">
                        <AiOutlineSetting size={20} />
                        <span>Settings</span>
                    </button>
                </div>
            </div>

            {downloads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <div className="relative mb-8">
                        <FaDownload size={80} className="text-white/10" />
                        <div className="absolute -bottom-2 -right-2 bg-primary w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#111]">
                            <span className="text-white text-xs font-bold">!</span>
                        </div>
                    </div>
                    <h2 className="text-2xl text-white font-semibold mb-3">Your library is empty</h2>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto">Start downloading movies and TV shows to watch them offline anytime, anywhere.</p>
                    <Link to="/" className="px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl transition shadow-lg shadow-primary/20">
                        Explore Content
                    </Link>
                </div>
            ) : (
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6"
                    : "flex flex-col gap-4"
                }>
                    {downloads.map((item) => (
                        <div key={item.id} className={`group ${viewMode === 'list'
                            ? "bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-6 hover:bg-white/10 transition"
                            : "relative"
                            }`}>
                            <div className={`${viewMode === 'list' ? 'shrink-0 w-24 aspect-[2/3]' : 'relative aspect-[2/3] rounded-2xl'
                                } overflow-hidden bg-[#222] shadow-xl group-hover:scale-[1.02] transition duration-500`}>
                                <LazyLoadImage
                                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                    alt={item.title || (item as any).name}
                                    effect="opacity"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center gap-4">
                                    {item.status === 'completed' && (
                                        <Link
                                            to={`/${item.media_type}/${item.id}/watch`}
                                            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-xl"
                                        >
                                            <FaPlay className="ml-1" size={20} />
                                        </Link>
                                    )}
                                    {item.status === 'downloading' && (
                                        <button className="w-14 h-14 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition backdrop-blur-md">
                                            <FaPause size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => dispatch(removeDownload(item.id))}
                                        className="mt-2 text-white/60 hover:text-red-500 transition text-sm flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-full"
                                    >
                                        <FaTrash size={12} />
                                        <span>Remove</span>
                                    </button>
                                </div>

                                {item.status === 'downloading' && (
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-primary h-full rounded-full transition-all duration-500"
                                                style={{ width: `${item.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={viewMode === 'list' ? 'flex-grow min-w-0' : 'mt-4'}>
                                <h3 className={`text-white font-bold truncate group-hover:text-primary transition ${viewMode === 'list' ? 'text-xl mb-2' : 'text-base'
                                    }`}>
                                    {item.title || (item as any).name}
                                </h3>

                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">
                                    <span className={`px-2 py-0.5 rounded ${item.media_type === 'tv' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {item.media_type}
                                    </span>
                                    <span>{item.size || "Analyzing..."}</span>
                                </div>

                                {item.status === 'downloading' && (
                                    <div className="mt-3 space-y-2">
                                        <div className="flex justify-between items-center text-xs font-medium">
                                            <span className="text-primary animate-pulse flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                                                Downloading...
                                            </span>
                                            <span className="text-white">{Math.round(item.progress)}%</span>
                                        </div>
                                        {viewMode === 'list' && (
                                            <div className="flex gap-4 text-xs text-gray-400">
                                                <span>Speed: {item.speed || "..."}</span>
                                                <span>ETA: {item.eta || "..."}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {item.status === 'completed' && (
                                    <div className="mt-2 flex items-center gap-1.5 text-green-500 text-[10px] font-bold uppercase tracking-tighter">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                        Ready to watch offline
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-20 p-8 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl border border-white/5">
                <div className="flex items-start gap-4">
                    <AiOutlineInfoCircle size={28} className="text-primary mt-1 shrink-0" />
                    <div>
                        <h4 className="text-white font-bold text-lg mb-2">Smart Offline Features</h4>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                            StreamLux uses advanced resolution matching to ensure your downloads are optimized for your device.
                            Downloaded files are stored in your device's native media gallery for easy access even without the app.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Downloads;
