import React, { FC, useEffect, useState } from 'react';
import { userStatsService, UserStats } from '../../services/userStats';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

const BADGES: { [key: string]: Badge } = {
    first_hour: {
        id: 'first_hour',
        name: 'First Hour',
        description: 'Watched 1 hour of content',
        icon: '🎬',
        color: 'from-blue-500 to-blue-600',
    },
    binge_watcher: {
        id: 'binge_watcher',
        name: 'Binge Watcher',
        description: 'Watched 10+ hours',
        icon: '📺',
        color: 'from-purple-500 to-purple-600',
    },
    movie_master: {
        id: 'movie_master',
        name: 'Movie Master',
        description: 'Watched 100+ hours',
        icon: '🏆',
        color: 'from-yellow-500 to-yellow-600',
    },
    week_warrior: {
        id: 'week_warrior',
        name: 'Week Warrior',
        description: '7-day streak',
        icon: '⚡',
        color: 'from-orange-500 to-orange-600',
    },
    monthly_master: {
        id: 'monthly_master',
        name: 'Monthly Master',
        description: '30-day streak',
        icon: '🔥',
        color: 'from-red-500 to-red-600',
    },
    movie_buff: {
        id: 'movie_buff',
        name: 'Movie Buff',
        description: 'Watched 10+ movies',
        icon: '🎥',
        color: 'from-green-500 to-green-600',
    },
    series_addict: {
        id: 'series_addict',
        name: 'Series Addict',
        description: 'Watched 50+ episodes',
        icon: '📹',
        color: 'from-pink-500 to-pink-600',
    },
};

const AchievementBadges: FC = () => {
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

    if (loading) {
        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Achievements</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-dark-lighten rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!stats || stats.achievementsBadges.length === 0) {
        return (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Achievements</h3>
                <div className="bg-dark-lighten rounded-lg p-6 text-center">
                    <p className="text-gray-400">Start watching to earn achievement badges!</p>
                </div>
            </div>
        );
    }

    const earnedBadges = stats.achievementsBadges.map(id => BADGES[id]).filter(Boolean);
    const lockedBadges = Object.values(BADGES).filter(
        badge => !stats.achievementsBadges.includes(badge.id)
    );

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span>🏆</span>
                Achievements
                <span className="text-sm text-gray-400 font-normal">
                    ({earnedBadges.length}/{Object.keys(BADGES).length})
                </span>
            </h3>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {/* Earned Badges */}
                {earnedBadges.map((badge) => (
                    <div
                        key={badge.id}
                        className="group relative aspect-square"
                        title={`${badge.name}: ${badge.description}`}
                    >
                        <div className={`
              w-full h-full rounded-lg
              bg-gradient-to-br ${badge.color}
              flex flex-col items-center justify-center
              transform hover:scale-110 transition-all duration-300
              shadow-lg hover:shadow-xl
            `}>
                            <span className="text-3xl md:text-4xl mb-1">{badge.icon}</span>
                            <span className="text-xs text-white font-medium text-center px-1">
                                {badge.name.split(' ')[0]}
                            </span>
                        </div>

                        {/* Tooltip */}
                        <div className="
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              bg-black bg-opacity-90 text-white text-xs rounded-lg px-3 py-2
              opacity-0 group-hover:opacity-100 transition-opacity
              pointer-events-none whitespace-nowrap z-10
            ">
                            <div className="font-semibold">{badge.name}</div>
                            <div className="text-gray-300">{badge.description}</div>
                        </div>
                    </div>
                ))}

                {/* Locked Badges */}
                {lockedBadges.map((badge) => (
                    <div
                        key={badge.id}
                        className="group relative aspect-square"
                        title={`Locked: ${badge.description}`}
                    >
                        <div className="
              w-full h-full rounded-lg
              bg-gray-700 bg-opacity-50
              flex flex-col items-center justify-center
              transform hover:scale-105 transition-all duration-300
              border-2 border-gray-600 border-dashed
            ">
                            <span className="text-3xl md:text-4xl mb-1 opacity-30 grayscale">
                                {badge.icon}
                            </span>
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </div>

                        {/* Tooltip */}
                        <div className="
              absolute bottom-full left-1/2 -translate-x-1/2 mb-2
              bg-black bg-opacity-90 text-white text-xs rounded-lg px-3 py-2
              opacity-0 group-hover:opacity-100 transition-opacity
              pointer-events-none whitespace-nowrap z-10
            ">
                            <div className="font-semibold text-gray-400">🔒 {badge.name}</div>
                            <div className="text-gray-400">{badge.description}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AchievementBadges;
