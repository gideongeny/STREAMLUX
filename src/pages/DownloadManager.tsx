import React, { FC, useState, useEffect } from 'react';
import { offlineDownloadService, DownloadItem } from '../../services/offlineDownload';
import { Link } from 'react-router-dom';

const DownloadManager: FC = () => {
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'downloading' | 'completed'>('all');

    useEffect(() => {
        loadDownloads();

        // Refresh every 2 seconds while downloads are active
        const interval = setInterval(loadDownloads, 2000);
        return () => clearInterval(interval);
    }, []);

    const loadDownloads = () => {
        const allDownloads = offlineDownloadService.getDownloads();
        setDownloads(allDownloads);
    };

    const handlePause = (id: string) => {
        offlineDownloadService.pauseDownload(id);
        loadDownloads();
    };

    const handleResume = (id: string) => {
        offlineDownloadService.resumeDownload(id);
        loadDownloads();
    };

    const handleCancel = async (id: string) => {
        if (confirm('Are you sure you want to cancel this download?')) {
            await offlineDownloadService.cancelDownload(id);
            loadDownloads();
        }
    };

    const handleClearCompleted = async () => {
        if (confirm('Clear all completed downloads?')) {
            await offlineDownloadService.clearCompleted();
            loadDownloads();
        }
    };

    const filteredDownloads = downloads.filter(item => {
        if (filter === 'downloading') return item.status === 'downloading' || item.status === 'queued' || item.status === 'paused';
        if (filter === 'completed') return item.status === 'completed';
        return true;
    });

    const totalStorage = offlineDownloadService.getTotalStorageUsed();
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getStatusColor = (status: DownloadItem['status']) => {
        switch (status) {
            case 'completed': return 'text-green-500';
            case 'downloading': return 'text-primary';
            case 'paused': return 'text-yellow-500';
            case 'failed': return 'text-red-500';
            default: return 'text-gray-400';
        }
    };

    const getStatusIcon = (status: DownloadItem['status']) => {
        switch (status) {
            case 'completed':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'downloading':
                return (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                );
            case 'paused':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'failed':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">My Downloads</h1>
                <p className="text-gray-400">Storage used: {formatBytes(totalStorage)}</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
                <button
                    onClick={() => setFilter('all')}
                    className={`pb-2 px-4 ${filter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
                >
                    All ({downloads.length})
                </button>
                <button
                    onClick={() => setFilter('downloading')}
                    className={`pb-2 px-4 ${filter === 'downloading' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
                >
                    In Progress ({downloads.filter(d => d.status !== 'completed').length})
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`pb-2 px-4 ${filter === 'completed' ? 'border-b-2 border-primary text-primary' : 'text-gray-400'}`}
                >
                    Completed ({downloads.filter(d => d.status === 'completed').length})
                </button>
            </div>

            {/* Clear Completed Button */}
            {filter === 'completed' && filteredDownloads.length > 0 && (
                <button
                    onClick={handleClearCompleted}
                    className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                    Clear All Completed
                </button>
            )}

            {/* Downloads List */}
            {filteredDownloads.length === 0 ? (
                <div className="text-center py-20">
                    <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <p className="text-gray-400 text-lg">No downloads yet</p>
                    <Link to="/" className="text-primary hover:underline mt-2 inline-block">
                        Browse content to download
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDownloads.map(item => (
                        <div key={item.id} className="bg-dark-lighten rounded-lg p-4 flex items-center gap-4">
                            {/* Thumbnail */}
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-24 h-36 object-cover rounded"
                            />

                            {/* Info */}
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                    <span className={getStatusColor(item.status)}>
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </span>
                                    <span>•</span>
                                    <span>{item.quality}</span>
                                    <span>•</span>
                                    <span>{formatBytes(item.size)}</span>
                                </div>

                                {/* Progress Bar */}
                                {item.status !== 'completed' && (
                                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    {item.status === 'downloading' && (
                                        <span>{Math.round(item.progress)}% • {formatBytes(item.downloadedBytes)} / {formatBytes(item.totalBytes)}</span>
                                    )}
                                    {item.status === 'completed' && item.completedAt && (
                                        <span>Downloaded {new Date(item.completedAt).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {getStatusIcon(item.status)}

                                {item.status === 'downloading' && (
                                    <button
                                        onClick={() => handlePause(item.id)}
                                        className="p-2 hover:bg-dark-lighten-2 rounded-lg transition-colors"
                                        title="Pause"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}

                                {item.status === 'paused' && (
                                    <button
                                        onClick={() => handleResume(item.id)}
                                        className="p-2 hover:bg-dark-lighten-2 rounded-lg transition-colors"
                                        title="Resume"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}

                                {item.status === 'completed' && (
                                    <Link
                                        to={item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`}
                                        className="p-2 hover:bg-dark-lighten-2 rounded-lg transition-colors"
                                        title="Watch"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </Link>
                                )}

                                <button
                                    onClick={() => handleCancel(item.id)}
                                    className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DownloadManager;
