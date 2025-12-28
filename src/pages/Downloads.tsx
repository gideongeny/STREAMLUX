import { FC } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { removeDownload } from "../store/slice/downloadSlice";
import { FaTrash, FaPlay, FaDownload } from "react-icons/fa";
import Title from "../components/Common/Title";
import Skeleton from "../components/Common/Skeleton";
import { LazyLoadImage } from "react-lazy-load-image-component";

const Downloads: FC = () => {
    const downloads = useAppSelector((state) => state.download.downloads);
    const dispatch = useAppDispatch();

    return (
        <div className="min-h-screen bg-[#141414] pt-20 px-[4vw] pb-10">
            <Title value="My Downloads | StreamLux" />

            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/20 p-3 rounded-full">
                    <FaDownload className="text-primary text-2xl" />
                </div>
                <h1 className="text-3xl text-white font-bold">My Downloads</h1>
            </div>

            {downloads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <img src="/error.png" alt="No downloads" className="w-[200px] mb-6 opacity-50 grayscale" />
                    <h2 className="text-2xl text-white font-semibold mb-2">No downloads yet</h2>
                    <p className="text-gray-400 mb-6">Movies and TV shows you download will appear here.</p>
                    <Link to="/" className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition">
                        Find Something to Download
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {downloads.map((item) => (
                        <div key={item.id} className="relative group">
                            <div className="aspect-[2/3] rounded-lg overflow-hidden bg-[#222]">
                                <LazyLoadImage
                                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                    alt={item.title || (item as any).name}
                                    effect="opacity"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col items-center justify-center gap-4">
                                    {item.status === 'completed' && (
                                        <Link
                                            to={`/${item.media_type}/${item.id}/watch`} // Just route to online watch for simulation
                                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition"
                                        >
                                            <FaPlay className="ml-1" />
                                        </Link>
                                    )}
                                    {item.status === 'downloading' && (
                                        <div className="text-white font-bold animate-pulse">
                                            {Math.round(item.progress)}%
                                        </div>
                                    )}
                                    <button
                                        onClick={() => dispatch(removeDownload(item.id))}
                                        className="w-10 h-10 bg-red-600/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2">
                                <h3 className="text-white font-medium truncate">{item.title || (item as any).name}</h3>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="capitalize">{item.media_type}</span>
                                    <span>•</span>
                                    <span>{item.size || "Unknown size"}</span>
                                    {item.status === 'downloading' && (
                                        <span className="text-primary">• Downloading...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Downloads;
