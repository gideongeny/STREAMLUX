/**
 * localWatchHistory.ts
 * -----------------------------------------------------------------
 * Guest-safe, localStorage-first watch-history service.
 *
 * Records every title the user plays via the provider player so they
 * show up in Library → History even without a Firebase account.
 * When the user IS signed in, records are also written to Firestore
 * so they are synced across devices just like TMDB-based plays.
 * -----------------------------------------------------------------
 */

import { safeStorage } from '../utils/safeStorage';

const LOCAL_HISTORY_KEY = 'streamlux_local_watch_history_v1';
const MAX_LOCAL_ITEMS = 100;

export interface LocalHistoryItem {
    /** Unique record id  – tmdb id when available, else a slug */
    id: string | number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    media_type: 'movie' | 'tv';
    /** ISO timestamp of last play */
    watchedAt: number;
    /** Which provider was used */
    provider?: string;
    season?: number;
    episode?: number;
    /** vote_average from TMDB when available */
    vote_average?: number;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
}

// ─── Read ────────────────────────────────────────────────────────────────────

export function getLocalHistory(): LocalHistoryItem[] {
    return safeStorage.getParsed<LocalHistoryItem[]>(LOCAL_HISTORY_KEY, []);
}

// ─── Write ───────────────────────────────────────────────────────────────────

export function addToLocalHistory(item: Omit<LocalHistoryItem, 'watchedAt'>): void {
    try {
        const existing = getLocalHistory();
        // Remove any previous entry for same id + media_type combo
        const filtered = existing.filter(
            (e) => !(String(e.id) === String(item.id) && e.media_type === item.media_type)
        );
        const updated = [{ ...item, watchedAt: Date.now() }, ...filtered].slice(0, MAX_LOCAL_ITEMS);
        safeStorage.set(LOCAL_HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
        console.warn('[localWatchHistory] Failed to save history entry:', err);
    }
}

// ─── Remove ──────────────────────────────────────────────────────────────────

export function removeFromLocalHistory(id: string | number, mediaType: 'movie' | 'tv'): void {
    const existing = getLocalHistory();
    const updated = existing.filter(
        (e) => !(String(e.id) === String(id) && e.media_type === mediaType)
    );
    safeStorage.set(LOCAL_HISTORY_KEY, JSON.stringify(updated));
}

export function clearLocalHistory(): void {
    safeStorage.remove(LOCAL_HISTORY_KEY);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Convert a LocalHistoryItem to the shape expected by FilmListViewForBookmarkAndHistory
 * (which uses the legacy `Item` type from shared/types.ts).
 */
export function toItem(h: LocalHistoryItem): any {
    return {
        id: typeof h.id === 'string' && isNaN(Number(h.id)) ? h.id : Number(h.id),
        title: h.media_type === 'movie' ? h.title : undefined,
        name: h.media_type === 'tv' ? h.title : undefined,
        poster_path: h.poster_path,
        backdrop_path: h.backdrop_path,
        media_type: h.media_type,
        vote_average: h.vote_average ?? 0,
        vote_count: 0,
        overview: h.overview ?? '',
        genre_ids: [],
        original_language: 'en',
        popularity: 0,
        release_date: h.release_date,
        first_air_date: h.first_air_date,
        // Mark as provider-sourced so we can target it differently if needed
        isScraped: true,
        provider: h.provider,
    };
}
