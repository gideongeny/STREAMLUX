import { FC, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineDelete, AiOutlinePlayCircle } from 'react-icons/ai';
import { BiLoaderAlt } from 'react-icons/bi';
import { MdSignalWifiOff } from 'react-icons/md';
import { offlineSyncService } from '../services/offlineSync';
import { indexedDBService, OfflineMediaMetadata } from '../services/indexedDB';
import { IMAGE_URL } from '../shared/constants';
import Title from '../components/Common/Title';
import Sidebar from '../components/Common/Sidebar';
import SidebarMini from '../components/Common/SidebarMini';
import SearchBox from '../components/Common/SearchBox';
import { useCurrentViewportView } from '../hooks/useCurrentViewportView';
import { GiHamburgerMenu } from 'react-icons/gi';
import { toast } from 'react-toastify';

const MyDownloads: FC = () => {
    const { isMobile } = useCurrentViewportView();
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [downloads, setDownloads] = useState<OfflineMediaMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storageUsed, setStorageUsed] = useState(0);
    const [storageQuota, setStorageQuota] = useState(0);
    const [playingMedia, setPlayingMedia] = useState<string | null>(null);

    useEffect(() => {
        loadDownloads();
        loadStorageInfo();
    }, []);

    const loadDownloads = async () => {
        setIsLoading(true);
        try {
            const allDownloads = await offlineSyncService.getAllSyncedMedia();
            setDownloads(allDownloads.sort((a, b) => b.downloadedAt - a.downloadedAt));
        } catch (error) {
            console.error('Failed to load downloads:', error);
            toast.error('Failed to load offline media');
        } finally {
            setIsLoading(false);
        }
    };

    const loadStorageInfo = async () => {
        const quota = await offlineSyncService.getStorageQuota();
        setStorageUsed(quota.usage);
        setStorageQuota(quota.quota);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this offline media?')) return;

        try {
            await offlineSyncService.deleteSyncedMedia(id);
            toast.success('Offline media deleted');
            await loadDownloads();
            await loadStorageInfo();
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.error('Failed to delete offline media');
        }
    };

    const handlePlay = async (id: string) => {
        try {
            const media = await indexedDBService.getMedia(id);
            if (!media || !media.blob) {
                toast.error('Media file not found');
                return;
            }

            // Create a blob URL for playback
            const blobUrl = URL.createObjectURL(media.blob);
            setPlayingMedia(blobUrl);

            // Update watch progress
            await indexedDBService.updateWatchProgress(id, 0);
        } catch (error) {
            console.error('Failed to play media:', error);
            toast.error('Failed to play offline media');
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStoragePercentage = (): number => {
        if (storageQuota === 0) return 0;
        return (storageUsed / storageQuota) * 100;
    };

    return (
        <>
            <Title value="My Downloads | StreamLux" />

            <div className="flex md:hidden justify-between items-center px-5 my-5">
                <Link to="/" className="flex gap-2 items-center">
                    <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
                    <p className="text-xl text-white font-medium tracking-wider uppercase">
                        Stream<span className="text-primary">Lux</span>
                    </p>
                </Link>
                <button onClick={() => setIsSidebarActive((prev) => !prev)}>
                    <GiHamburgerMenu size={25} />
                </button>
            </div>

            <div className="flex flex-col md:flex-row">
                {!isMobile && <SidebarMini />}
                {isMobile && (
                    <Sidebar
                        onCloseSidebar={() => setIsSidebarActive(false)}
                        isSidebarActive={isSidebarActive}
                    />
                )}

                <div className="flex-grow px-[2vw] md:pt-11 pt-0 min-h-screen">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <MdSignalWifiOff className="text-primary" size={32} />
                            <h1 className="text-white text-3xl font-bold">My Downloads</h1>
                        </div>
                        <p className="text-gray-400">
                            Watch your downloaded content offline without internet connection
                        </p>
                    </div>

                    {/* Storage Info */}
                    <div className="bg-dark-lighten rounded-xl p-6 border border-gray-800 mb-6">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-white font-medium">Storage Usage</h3>
                            <span className="text-gray-400 text-sm">
                                {formatBytes(storageUsed)} / {formatBytes(storageQuota)}
                            </span>
                        </div>
                        <div className="w-full bg-dark-darken rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${getStoragePercentage() > 90 ? 'bg-red-500' :
                                    getStoragePercentage() > 70 ? 'bg-yellow-500' : 'bg-primary'
                                    }`}
                                style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {downloads.length} item{downloads.length !== 1 ? 's' : ''} downloaded
                        </p>
                    </div>

                    {/* Downloads Grid */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <BiLoaderAlt className="animate-spin text-primary" size={48} />
                        </div>
                    ) : downloads.length === 0 ? (
                        <div className="text-center py-20">
                            <MdSignalWifiOff className="text-gray-600 mx-auto mb-4" size={64} />
                            <h2 className="text-white text-2xl font-bold mb-2">No Offline Content</h2>
                            <p className="text-gray-400 mb-6">
                                Start downloading movies and TV shows to watch offline
                            </p>
                            <Link
                                to="/"
                                className="inline-block bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-lg font-medium transition"
                            >
                                Browse Content
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {downloads.map((media) => (
                                <div
                                    key={media.id}
                                    className="bg-dark-lighten rounded-lg overflow-hidden border border-gray-800 hover:border-primary transition group"
                                >
                                    {/* Poster */}
                                    <div className="relative aspect-[2/3]">
                                        <img
                                            src={
                                                media.posterPath
                                                    ? `${IMAGE_URL}/w500${media.posterPath}`
                                                    : '/placeholder-poster.png'
                                            }
                                            alt={media.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handlePlay(media.id)}
                                                className="bg-primary hover:bg-primary/80 text-white p-3 rounded-full transition"
                                                title="Play Offline"
                                            >
                                                <AiOutlinePlayCircle size={24} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(media.id)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition"
                                                title="Delete"
                                            >
                                                <AiOutlineDelete size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3">
                                        <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                                            {media.title}
                                        </h3>
                                        {media.episodeTitle && (
                                            <p className="text-gray-400 text-xs mb-1">
                                                S{media.seasonNumber}E{media.episodeNumber}: {media.episodeTitle}
                                            </p>
                                        )}
                                        <p className="text-gray-500 text-xs">
                                            Downloaded {formatDate(media.downloadedAt)}
                                        </p>
                                        {media.fileSize && (
                                            <p className="text-gray-500 text-xs mt-1">
                                                {formatBytes(media.fileSize)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="shrink-0 md:max-w-[400px] w-full relative px-6">
                    {!isMobile && <SearchBox />}
                </div>
            </div>

            {/* Offline Player Modal */}
            {playingMedia && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                    <div className="w-full max-w-5xl">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => {
                                    URL.revokeObjectURL(playingMedia);
                                    setPlayingMedia(null);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                        <video
                            src={playingMedia}
                            controls
                            autoPlay
                            className="w-full rounded-lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default MyDownloads;
