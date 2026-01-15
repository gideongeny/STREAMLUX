import { FC, useState, useEffect } from 'react';
import { AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { FaDownload } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';
import { offlineSyncService, SyncProgress } from '../../services/offlineSync';
import { DetailMovie, DetailTV } from '../../shared/types';
import { toast } from 'react-toastify';

interface OfflineSyncButtonProps {
    detail: DetailMovie | DetailTV;
    mediaType: 'movie' | 'tv';
    providerUrl: string;
    seasonNumber?: number;
    episodeNumber?: number;
    episodeTitle?: string;
}

const OfflineSyncButton: FC<OfflineSyncButtonProps> = ({
    detail,
    mediaType,
    providerUrl,
    seasonNumber,
    episodeNumber,
    episodeTitle,
}) => {
    const [isSynced, setIsSynced] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [progress, setProgress] = useState<SyncProgress | null>(null);
    const [storageInfo, setStorageInfo] = useState<{ usage: number; quota: number } | null>(null);

    useEffect(() => {
        checkIfSynced();
        loadStorageInfo();
    }, [detail.id, mediaType, seasonNumber, episodeNumber]);

    const checkIfSynced = async () => {
        const synced = await offlineSyncService.isMediaSynced(
            detail.id,
            mediaType,
            seasonNumber,
            episodeNumber
        );
        setIsSynced(synced);
    };

    const loadStorageInfo = async () => {
        const info = await offlineSyncService.getStorageQuota();
        setStorageInfo(info);
    };

    const handleSync = async () => {
        if (isSynced || isSyncing) return;

        setIsSyncing(true);

        try {
            await offlineSyncService.syncMedia(
                detail,
                mediaType,
                providerUrl,
                seasonNumber,
                episodeNumber,
                episodeTitle,
                (progressUpdate) => {
                    setProgress(progressUpdate);
                }
            );

            setIsSynced(true);
            toast.success('Media synced for offline viewing!');
            await loadStorageInfo();
        } catch (error: any) {
            console.error('Sync error:', error);
            toast.error(`Failed to sync: ${error.message}`);
        } finally {
            setIsSyncing(false);
            setProgress(null);
        }
    };

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getStoragePercentage = (): number => {
        if (!storageInfo || storageInfo.quota === 0) return 0;
        return (storageInfo.usage / storageInfo.quota) * 100;
    };

    return (
        <div className="bg-dark-lighten rounded-xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                    <FaDownload className="text-primary" size={20} />
                    Offline Sync
                </h3>
                {storageInfo && (
                    <span className="text-xs text-gray-400">
                        {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
                    </span>
                )}
            </div>

            {/* Storage bar */}
            {storageInfo && storageInfo.quota > 0 && (
                <div className="mb-3">
                    <div className="w-full bg-dark-darken rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${getStoragePercentage() > 90 ? 'bg-red-500' :
                                getStoragePercentage() > 70 ? 'bg-yellow-500' : 'bg-primary'
                                }`}
                            style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Sync button */}
            <button
                onClick={handleSync}
                disabled={isSynced || isSyncing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${isSynced
                    ? 'bg-green-500/20 text-green-500 border border-green-500/50 cursor-not-allowed'
                    : isSyncing
                        ? 'bg-primary/20 text-primary border border-primary/50 cursor-wait'
                        : 'bg-primary hover:bg-primary/80 text-white border border-primary'
                    }`}
            >
                {isSynced ? (
                    <>
                        <AiOutlineCheck size={20} />
                        Synced for Offline
                    </>
                ) : isSyncing ? (
                    <>
                        <BiLoaderAlt size={20} className="animate-spin" />
                        {progress?.status === 'resolving' && 'Resolving URL...'}
                        {progress?.status === 'downloading' && `Downloading ${progress.progress}%`}
                        {progress?.status === 'pending' && 'Starting...'}
                    </>
                ) : (
                    <>
                        <FaDownload size={20} />
                        Sync for Offline
                    </>
                )}
            </button>

            {/* Progress bar */}
            {isSyncing && progress && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{progress.status}</span>
                        <span>{progress.progress}%</span>
                    </div>
                    <div className="w-full bg-dark-darken rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>
                    {progress.totalBytes > 0 && (
                        <div className="text-xs text-gray-500 mt-1 text-center">
                            {formatBytes(progress.downloadedBytes)} / {formatBytes(progress.totalBytes)}
                        </div>
                    )}
                </div>
            )}

            <p className="text-xs text-gray-500 mt-3 text-center">
                Download this media to watch offline without internet connection
            </p>
        </div>
    );
};

export default OfflineSyncButton;
