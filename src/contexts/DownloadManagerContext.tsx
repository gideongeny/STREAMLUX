import React, {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from 'react';

export type DownloadStatus = 'queued' | 'downloading' | 'done' | 'error';

export interface DownloadItem {
    id: string;
    filename: string;
    status: DownloadStatus;
    progress: number;      // 0-100
    speedKBps: number;     // kb/s
    receivedBytes: number;
    totalBytes: number;
    etaSeconds: number;
    errorMsg?: string;
    startedAt: number;     // Date.now()
}

interface DownloadManagerContextValue {
    downloads: DownloadItem[];
    addDownload: (url: string, filename: string) => string; // returns download id
    removeDownload: (id: string) => void;
    clearDone: () => void;
}

const DownloadManagerContext = createContext<DownloadManagerContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export const DownloadManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const idCounter = useRef(0);

    const updateItem = useCallback((id: string, patch: Partial<DownloadItem>) => {
        setDownloads((prev) =>
            prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
        );
    }, []);

    const addDownload = useCallback(
        (url: string, filename: string): string => {
            const id = `dl-${Date.now()}-${idCounter.current++}`;
            const item: DownloadItem = {
                id,
                filename,
                status: 'queued',
                progress: 0,
                speedKBps: 0,
                receivedBytes: 0,
                totalBytes: 0,
                etaSeconds: 0,
                startedAt: Date.now(),
            };
            setDownloads((prev) => [item, ...prev]);
            startDownload(id, url, filename);
            return id;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const startDownload = async (id: string, url: string, filename: string) => {
        updateItem(id, { status: 'downloading', startedAt: Date.now() });

        try {
            const response = await fetch(url, { mode: 'cors' });
            if (!response.ok) throw new Error(`Server returned ${response.status}`);

            const contentLength = response.headers.get('content-length');
            const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
            const reader = response.body!.getReader();
            const chunks: Uint8Array[] = [];
            let receivedBytes = 0;
            let lastSpeedUpdate = Date.now();
            let lastSpeedBytes = 0;

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedBytes += value.length;

                const now = Date.now();
                const elapsed = (now - lastSpeedUpdate) / 1000;
                if (elapsed >= 0.5) {
                    const bytesDelta = receivedBytes - lastSpeedBytes;
                    const speedKBps = Math.round(bytesDelta / elapsed / 1024);
                    const remaining = totalBytes > 0 ? totalBytes - receivedBytes : 0;
                    const etaSeconds =
                        speedKBps > 0 && remaining > 0
                            ? Math.round(remaining / (speedKBps * 1024))
                            : 0;
                    const progress =
                        totalBytes > 0
                            ? Math.min(99, Math.round((receivedBytes / totalBytes) * 100))
                            : Math.min(75, Math.round((receivedBytes / (receivedBytes + 5_000_000)) * 75));

                    updateItem(id, {
                        progress,
                        speedKBps,
                        receivedBytes,
                        totalBytes,
                        etaSeconds,
                    });
                    lastSpeedUpdate = now;
                    lastSpeedBytes = receivedBytes;
                }
            }

            // Trigger browser save dialog
            const blob = new Blob(chunks);
            const objUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(objUrl), 15_000);

            updateItem(id, { status: 'done', progress: 100, etaSeconds: 0 });
        } catch (err: any) {
            updateItem(id, { status: 'error', errorMsg: err?.message ?? 'Unknown error' });
        }
    };

    const removeDownload = useCallback((id: string) => {
        setDownloads((prev) => prev.filter((d) => d.id !== id));
    }, []);

    const clearDone = useCallback(() => {
        setDownloads((prev) => prev.filter((d) => d.status !== 'done' && d.status !== 'error'));
    }, []);

    return (
        <DownloadManagerContext.Provider value={{ downloads, addDownload, removeDownload, clearDone }}>
            {children}
        </DownloadManagerContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useDownloadManager = (): DownloadManagerContextValue => {
    const ctx = useContext(DownloadManagerContext);
    if (!ctx) throw new Error('useDownloadManager must be used within DownloadManagerProvider');
    return ctx;
};
