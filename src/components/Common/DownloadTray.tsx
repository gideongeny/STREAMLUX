import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineDownload, AiOutlineMinusCircle } from 'react-icons/ai';
import { FaCheckCircle, FaExclamationCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdSpeed } from 'react-icons/md';
import { useDownloadManager, DownloadItem } from '../../contexts/DownloadManagerContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtBytes = (b: number): string => {
    if (b === 0) return '0 B';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

const fmtETA = (s: number): string => {
    if (!s || s <= 0) return '';
    if (s < 60) return `${s}s left`;
    return `${Math.floor(s / 60)}m ${s % 60}s left`;
};

// ─── Single Download Row ──────────────────────────────────────────────────────
const DownloadRow: React.FC<{ item: DownloadItem; onRemove: () => void }> = ({
    item,
    onRemove,
}) => {
    const isActive = item.status === 'downloading';
    const isDone = item.status === 'done';
    const isError = item.status === 'error';
    const isQueued = item.status === 'queued';

    return (
        <div className="group relative px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
            {/* Top row: icon + filename + remove */}
            <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-shrink-0">
                    {isDone ? (
                        <FaCheckCircle className="text-green-400" size={14} />
                    ) : isError ? (
                        <FaExclamationCircle className="text-red-400" size={14} />
                    ) : isQueued ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-600 animate-pulse" />
                    ) : (
                        <AiOutlineDownload className="text-primary animate-bounce" size={16} />
                    )}
                </div>

                <span
                    className="flex-grow text-xs text-white font-medium truncate max-w-[200px]"
                    title={item.filename}
                >
                    {item.filename}
                </span>

                <button
                    onClick={onRemove}
                    className="opacity-0 group-hover:opacity-100 ml-auto text-gray-500 hover:text-white transition-all flex-shrink-0"
                >
                    <AiOutlineClose size={12} />
                </button>
            </div>

            {/* Progress bar */}
            {(isActive || isQueued) && (
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mb-1.5">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${isActive
                                ? 'bg-gradient-to-r from-primary via-blue-400 to-primary bg-[length:200%_100%] animate-shimmer'
                                : 'bg-white/20'
                            }`}
                        style={{ width: isActive ? `${item.progress}%` : '15%' }}
                    />
                </div>
            )}

            {/* Bottom meta */}
            <div className="flex items-center justify-between text-[10px] text-gray-500">
                {isActive && (
                    <>
                        <span className="flex items-center gap-1">
                            <MdSpeed size={11} />
                            {item.speedKBps > 0 ? `${item.speedKBps} KB/s` : 'Starting…'}
                        </span>
                        <span className="flex items-center gap-2">
                            {item.totalBytes > 0 && (
                                <span>
                                    {fmtBytes(item.receivedBytes)} / {fmtBytes(item.totalBytes)}
                                </span>
                            )}
                            <span className="text-primary font-bold">{item.progress}%</span>
                            {item.etaSeconds > 0 && <span>{fmtETA(item.etaSeconds)}</span>}
                        </span>
                    </>
                )}
                {isDone && (
                    <span className="text-green-400 font-semibold">Saved to downloads</span>
                )}
                {isError && (
                    <span className="text-red-400 truncate max-w-full" title={item.errorMsg}>
                        {item.errorMsg ?? 'Download failed'}
                    </span>
                )}
                {isQueued && <span>Waiting in queue…</span>}
            </div>
        </div>
    );
};

// ─── Main Floating Tray ───────────────────────────────────────────────────────
const DownloadTray: React.FC = () => {
    const { downloads, removeDownload, clearDone } = useDownloadManager();
    const [collapsed, setCollapsed] = useState(false);

    if (downloads.length === 0) return null;

    const activeCount = downloads.filter(
        (d) => d.status === 'downloading' || d.status === 'queued'
    ).length;
    const doneCount = downloads.filter((d) => d.status === 'done' || d.status === 'error').length;

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] w-[320px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#111111]/95 backdrop-blur-xl"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                <AiOutlineDownload className="text-primary flex-shrink-0" size={16} />
                <span className="text-white font-bold text-sm flex-grow">
                    Downloads
                    {activeCount > 0 && (
                        <span className="ml-2 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">
                            {activeCount} active
                        </span>
                    )}
                </span>
                {doneCount > 0 && (
                    <button
                        onClick={clearDone}
                        className="text-[10px] text-gray-500 hover:text-white mr-2 transition-colors"
                    >
                        Clear done
                    </button>
                )}
                <button
                    onClick={() => setCollapsed((v) => !v)}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    {collapsed ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
            </div>

            {/* Downloads list */}
            {!collapsed && (
                <div className="max-h-[60vh] overflow-y-auto no-scrollbar">
                    {downloads.map((item) => (
                        <DownloadRow
                            key={item.id}
                            item={item}
                            onRemove={() => removeDownload(item.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DownloadTray;
