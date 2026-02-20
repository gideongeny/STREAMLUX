import React, { FC, useEffect, useState } from 'react';
import { userStatsService, UserStats } from '../../services/userStats';

const ProfileStats: FC = () => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const data = await userStatsService.getUserStats();
        setStats(data);
        setLoading(false);
    };

    const formatWatchTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours}h`;
        }
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    };

    const getStreakEmoji = (streak: number): string => {
        if (streak >= 30) return '🔥';
        if (streak >= 7) return '⚡';
        if (streak >= 3) return '✨';
        return '📺';
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-dark-lighten rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
                        <div className="h-8 bg-gray-700 rounded w-3/4" />
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Watch Time */}
            <div className="bg-gradient-to-br from-primary to-orange-600 rounded-lg p-4 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-white text-sm font-medium">Watch Time</p>
                </div>
                <p className="text-3xl font-bold text-white">{formatWatchTime(stats.totalWatchTime)}</p>
            </div>

            {/* Current Streak */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-4 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getStreakEmoji(stats.currentStreak)}</span>
                    <p className="text-white text-sm font-medium">Streak</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats.currentStreak} days</p>
            </div>

            {/* Movies Watched */}
            <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg p-4 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <p className="text-white text-sm font-medium">Movies</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalMoviesWatched}</p>
            </div>

            {/* TV Episodes */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg p-4 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 16a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2h8z" />
                    </svg>
                    <p className="text-white text-sm font-medium">Episodes</p>
                </div>
                <p className="text-3xl font-bold text-white">{stats.totalTVEpisodesWatched}</p>
            </div>
        </div>
    );
};

export default ProfileStats;
