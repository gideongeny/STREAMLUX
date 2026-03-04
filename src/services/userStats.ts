/**
 * User Statistics Service
 * Tracks watch time, favorites, viewing patterns
 */

import { db } from '../shared/firebase';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

export interface UserStats {
    totalWatchTime: number; // minutes
    totalMoviesWatched: number;
    totalTVEpisodesWatched: number;
    favoriteGenres: { [genre: string]: number };
    currentStreak: number; // days
    longestStreak: number; // days
    lastWatchDate: string; // ISO date
    achievementsBadges: string[];
    joinDate: string;
}

class UserStatsService {
    private userId: string | null = null;

    setUserId(userId: string): void {
        this.userId = userId;
    }

    /**
     * Get user statistics
     */
    async getUserStats(): Promise<UserStats | null> {
        if (!this.userId) return null;

        try {
            const docRef = doc(db, 'userStats', this.userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as UserStats;
            } else {
                // Initialize new user stats
                const newStats: UserStats = {
                    totalWatchTime: 0,
                    totalMoviesWatched: 0,
                    totalTVEpisodesWatched: 0,
                    favoriteGenres: {},
                    currentStreak: 0,
                    longestStreak: 0,
                    lastWatchDate: new Date().toISOString().split('T')[0],
                    achievementsBadges: [],
                    joinDate: new Date().toISOString(),
                };

                await setDoc(docRef, newStats);
                return newStats;
            }
        } catch (error) {
            console.error('Error getting user stats:', error);
            return null;
        }
    }

    /**
     * Update watch time
     */
    async addWatchTime(minutes: number, type: 'movie' | 'tv', genres: string[]): Promise<void> {
        if (!this.userId) return;

        try {
            const docRef = doc(db, 'userStats', this.userId);
            const updates: any = {
                totalWatchTime: increment(minutes),
            };

            if (type === 'movie') {
                updates.totalMoviesWatched = increment(1);
            } else {
                updates.totalTVEpisodesWatched = increment(1);
            }

            // Update favorite genres
            const stats = await this.getUserStats();
            if (stats) {
                genres.forEach(genre => {
                    stats.favoriteGenres[genre] = (stats.favoriteGenres[genre] || 0) + 1;
                });
                updates.favoriteGenres = stats.favoriteGenres;
            }

            // Update streak
            const today = new Date().toISOString().split('T')[0];
            if (stats && stats.lastWatchDate !== today) {
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                if (stats.lastWatchDate === yesterday) {
                    // Continue streak
                    updates.currentStreak = increment(1);
                    updates.longestStreak = Math.max(stats.currentStreak + 1, stats.longestStreak);
                } else {
                    // Streak broken
                    updates.currentStreak = 1;
                }

                updates.lastWatchDate = today;
            }

            await updateDoc(docRef, updates);

            // Check for achievements
            await this.checkAchievements();
        } catch (error) {
            console.error('Error updating watch time:', error);
        }
    }

    /**
     * Check and award achievements
     */
    private async checkAchievements(): Promise<void> {
        if (!this.userId) return;

        const stats = await this.getUserStats();
        if (!stats) return;

        const newBadges: string[] = [];

        // Watch time achievements
        if (stats.totalWatchTime >= 60 && !stats.achievementsBadges.includes('first_hour')) {
            newBadges.push('first_hour');
        }
        if (stats.totalWatchTime >= 600 && !stats.achievementsBadges.includes('binge_watcher')) {
            newBadges.push('binge_watcher');
        }
        if (stats.totalWatchTime >= 6000 && !stats.achievementsBadges.includes('movie_master')) {
            newBadges.push('movie_master');
        }

        // Streak achievements
        if (stats.currentStreak >= 7 && !stats.achievementsBadges.includes('week_warrior')) {
            newBadges.push('week_warrior');
        }
        if (stats.currentStreak >= 30 && !stats.achievementsBadges.includes('monthly_master')) {
            newBadges.push('monthly_master');
        }

        // Content achievements
        if (stats.totalMoviesWatched >= 10 && !stats.achievementsBadges.includes('movie_buff')) {
            newBadges.push('movie_buff');
        }
        if (stats.totalTVEpisodesWatched >= 50 && !stats.achievementsBadges.includes('series_addict')) {
            newBadges.push('series_addict');
        }

        if (newBadges.length > 0) {
            const docRef = doc(db, 'userStats', this.userId);
            await updateDoc(docRef, {
                achievementsBadges: [...stats.achievementsBadges, ...newBadges],
            });
        }
    }

    /**
     * Get top genres
     */
    async getTopGenres(limit: number = 5): Promise<Array<{ genre: string; count: number }>> {
        const stats = await this.getUserStats();
        if (!stats) return [];

        return Object.entries(stats.favoriteGenres)
            .map(([genre, count]) => ({ genre, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
}

export const userStatsService = new UserStatsService();
