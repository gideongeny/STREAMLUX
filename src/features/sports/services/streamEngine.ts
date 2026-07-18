import axios from 'axios';
import { SportMatch } from '../types';
import { getWatchFootyMatchById } from '../../../services/watchfootyAPI';

export interface StreamSource {
    id: string;
    name: string;
    url: string;
    type: 'hls' | 'dash' | 'iframe';
    quality: 'HD' | 'SD' | '4K' | 'Mobile' | 'Auto';
    priority: number;
    isPremium: boolean;
    status: 'online' | 'offline' | 'checking';
    lastChecked?: number;
    site?: string;
}

const isHlsUrl = (url: string) =>
    url.includes('.m3u8') || url.includes('.m3u') || url.includes('master.m3u8');

const mapWfStream = (matchId: string, s: { id: string; url: string; quality?: string; source?: string }, i: number): StreamSource => {
    const hls = isHlsUrl(s.url);
    return {
        id: s.id || `${matchId}-wf-${i}`,
        name: s.source ? s.source.charAt(0).toUpperCase() + s.source.slice(1) : (s.quality || `Server ${i + 1}`),
        url: s.url,
        type: hls ? 'hls' : 'iframe',
        quality: (s.quality?.toUpperCase() as StreamSource['quality']) || 'HD',
        priority: i,
        isPremium: true,
        status: 'online',
        site: 'watchfooty',
    };
};

class StreamEngine {
    private static instance: StreamEngine;
    private sources: Map<string, StreamSource[]> = new Map();
    private gateway = 'https://streamlux.vercel.app/api/gateway';

    private constructor() {}

    static getInstance() {
        if (!StreamEngine.instance) {
            StreamEngine.instance = new StreamEngine();
        }
        return StreamEngine.instance;
    }

    async resolveSources(match: SportMatch, onNewSource?: (sources: StreamSource[]) => void): Promise<StreamSource[]> {
        const matchId = match.id;
        if (this.sources.has(matchId)) return this.sources.get(matchId)!;

        const allSources: StreamSource[] = [];
        let wfStreams = match.watchfootyStreams ?? [];

        if (wfStreams.length === 0 && match.matchId) {
            const fresh = await getWatchFootyMatchById(String(match.matchId));
            wfStreams = fresh?.watchfootyStreams ?? [];
            if (fresh?.streamUrl && !wfStreams.some((s) => s.url === fresh.streamUrl)) {
                wfStreams = [{ id: `${matchId}-primary`, url: fresh.streamUrl, quality: 'HD' }, ...wfStreams];
            }
        }

        if (wfStreams.length === 0 && match.streamUrl) {
            wfStreams = [{ id: `${matchId}-stream`, url: match.streamUrl, quality: 'HD' }];
        }

        wfStreams.forEach((s, i) => {
            if (s.url) allSources.push(mapWfStream(matchId, s, i));
        });

        // DaddyLive streams are already direct HLS — flag them so player uses <video> not iframe
        allSources.forEach(src => {
            if (src.url.includes('daddylivehd') && src.url.includes('.m3u8')) {
                src.type = 'hls';
                src.isPremium = true;
            }
        });

        allSources.forEach((src) => {
            if (src.type === 'iframe') {
                axios
                    .get(`${this.gateway}/resolve`, { params: { url: src.url }, timeout: 25000 })
                    .then((res) => {
                        if (!res.data?.directUrl) return;
                        const resolvedUrl = res.data.directUrl as string;
                        const list = this.sources.get(matchId) || [...allSources];
                        const resolvedId = `${src.id}-hls`;
                        if (list.some((x) => x.id === resolvedId)) return;
                        list.unshift({
                            id: resolvedId,
                            name: 'Direct',
                            url: resolvedUrl,
                            type: isHlsUrl(resolvedUrl) ? 'hls' : 'iframe',
                            quality: 'HD',
                            priority: -1,
                            isPremium: true,
                            status: 'online',
                            site: 'watchfooty',
                        });
                        this.sources.set(matchId, list);
                        if (onNewSource) onNewSource([...list]);
                    })
                    .catch(() => {});
            }
        });

        // Async NTV Multi-Server Resolution (Kobra, Raptor, Falcon, Phoenix)
        const ntvServers = ['kobra', 'raptor', 'falcon', 'phoenix'];
        const matchTitle = `${match.homeTeam} ${match.awayTeam}`.trim();
        
        if (matchTitle.length > 3 && matchTitle !== "undefined undefined") {
            ntvServers.forEach(server => {
                axios.post('https://streamlux.vercel.app/api/external', {
                    provider: 'ntv-resolve',
                    query: { match: matchTitle, server: server }
                }, { timeout: 15000 }).then(res => {
                    if (res.data?.success && res.data?.url) {
                        const list = this.sources.get(matchId) || [];
                        if (list.some(s => s.id === `ntv-${server}`)) return;
                        
                        // Add to the list (after DaddyLive, before generic WatchFooty)
                        list.splice(1, 0, {
                            id: `ntv-${server}`,
                            name: server.charAt(0).toUpperCase() + server.slice(1),
                            url: res.data.url,
                            type: 'iframe',
                            quality: 'HD',
                            priority: 1,
                            isPremium: true,
                            status: 'online',
                            site: 'ntv'
                        });
                        this.sources.set(matchId, list);
                        if (onNewSource) onNewSource([...list]);
                    }
                }).catch(() => {});
            });
        }

        this.sources.set(matchId, allSources);
        return allSources;
    }

    reportDeadStream(matchId: string, sourceId: string) {
        const sources = this.sources.get(matchId);
        if (sources) {
            const source = sources.find(s => s.id === sourceId);
            if (source) source.status = 'offline';
        }
    }
}

export const streamEngine = StreamEngine.getInstance();
