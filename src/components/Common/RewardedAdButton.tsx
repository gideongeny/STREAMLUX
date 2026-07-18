import React, { FC, useState, useEffect } from 'react';
import { adManager, RewardType } from '../../services/adManager';

interface RewardedAdButtonProps {
    rewardType: RewardType;
    onRewardEarned: () => void;
    className?: string;
    children?: React.ReactNode;
}

const RewardedAdButton: FC<RewardedAdButtonProps> = ({
    rewardType,
    onRewardEarned,
    className = '',
    children,
}) => {
    const [canWatch, setCanWatch] = useState(false);
    const [isWatching, setIsWatching] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);

    useEffect(() => {
        checkAvailability();
        const interval = setInterval(checkAvailability, 1000);
        return () => clearInterval(interval);
    }, [rewardType]);

    const checkAvailability = () => {
        const available = adManager.canWatchRewardedAd(rewardType);
        setCanWatch(available);

        if (!available) {
            // Calculate cooldown remaining
            const config = adManager.getRewardedAdConfig(rewardType);
            // This is simplified - in production, track actual cooldown end time
            setCooldownRemaining(config.cooldown);
        }
    };

    const handleWatchAd = () => {
        if (!canWatch) return;

        setIsWatching(true);
        const config = adManager.getRewardedAdConfig(rewardType);
        setCountdown(config.duration);

        // Simulate ad playback (in production, integrate with actual ad network)
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleAdComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleAdComplete = () => {
        adManager.markRewardedAdWatched(rewardType);
        setIsWatching(false);
        setCanWatch(false);
        onRewardEarned();
    };

    const getRewardText = () => {
        switch (rewardType) {
            case 'download':
                return 'Watch Ad to Download';
            case 'premium_unlock':
                return 'Watch Ad for Premium Access';
            case 'remove_watermark':
                return 'Watch Ad to Remove Watermark';
            default:
                return 'Watch Ad for Reward';
        }
    };

    if (isWatching) {
        return (
            <div className={`relative ${className}`}>
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    <div className="bg-dark-lighten rounded-xl p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{countdown}</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Watching Ad...
                            </h3>
                            <p className="text-gray-400 mb-4">
                                Please wait {countdown} seconds to earn your reward
                            </p>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                                    style={{
                                        width: `${((adManager.getRewardedAdConfig(rewardType).duration - countdown) / adManager.getRewardedAdConfig(rewardType).duration) * 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handleWatchAd}
            disabled={!canWatch}
            className={`
        relative overflow-hidden
        ${canWatch
                    ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary-dark hover:to-purple-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }
        text-white font-semibold py-3 px-6 rounded-lg
        transition-all duration-300
        flex items-center justify-center gap-2
        ${className}
      `}
        >
            {canWatch ? (
                <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    {children || getRewardText()}
                </>
            ) : (
                <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Available in {cooldownRemaining} min
                </>
            )}
        </button>
    );
};

export default RewardedAdButton;
