import React, { FC, useState, useEffect } from 'react';
import { pushNotificationService } from '../../services/pushNotifications';

const NotificationSettings: FC = () => {
    const [preferences, setPreferences] = useState(pushNotificationService.getPreferences());
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        checkNotificationStatus();
    }, []);

    const checkNotificationStatus = async () => {
        const enabled = await pushNotificationService.areNotificationsEnabled();
        setIsEnabled(enabled);
    };

    const handleToggle = (key: keyof typeof preferences) => {
        const updated = { ...preferences, [key]: !preferences[key] };
        setPreferences(updated);
        pushNotificationService.updatePreferences(updated);
    };

    const handleRequestPermission = async () => {
        await pushNotificationService.initialize();
        checkNotificationStatus();
    };

    if (!isEnabled) {
        return (
            <div className="bg-dark-lighten rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Push Notifications</h3>
                <p className="text-gray-400 mb-4">
                    Enable notifications to get updates about new episodes, downloads, and more.
                </p>
                <button
                    onClick={handleRequestPermission}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-white font-semibold transition-colors"
                >
                    Enable Notifications
                </button>
            </div>
        );
    }

    return (
        <div className="bg-dark-lighten rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Notification Preferences</h3>

            <div className="space-y-4">
                <NotificationToggle
                    label="New Episodes"
                    description="Get notified when new episodes of your favorite shows are available"
                    enabled={preferences.newEpisodes}
                    onToggle={() => handleToggle('newEpisodes')}
                />

                <NotificationToggle
                    label="Download Complete"
                    description="Notifications when your downloads finish"
                    enabled={preferences.downloads}
                    onToggle={() => handleToggle('downloads')}
                />

                <NotificationToggle
                    label="Trending Content"
                    description="Discover trending movies and shows in your region"
                    enabled={preferences.trending}
                    onToggle={() => handleToggle('trending')}
                />

                <NotificationToggle
                    label="Achievements"
                    description="Get notified when you unlock new achievements"
                    enabled={preferences.achievements}
                    onToggle={() => handleToggle('achievements')}
                />

                <NotificationToggle
                    label="Daily Reminders"
                    description="Daily engagement and streak reminders"
                    enabled={preferences.dailyReminder}
                    onToggle={() => handleToggle('dailyReminder')}
                />

                <NotificationToggle
                    label="Recommendations"
                    description="Personalized content recommendations based on your viewing history"
                    enabled={preferences.recommendations}
                    onToggle={() => handleToggle('recommendations')}
                />
            </div>
        </div>
    );
};

interface NotificationToggleProps {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}

const NotificationToggle: FC<NotificationToggleProps> = ({ label, description, enabled, onToggle }) => {
    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-700 last:border-0">
            <div className="flex-grow pr-4">
                <h4 className="text-white font-medium mb-1">{label}</h4>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <button
                onClick={onToggle}
                className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? 'bg-primary' : 'bg-gray-600'}
        `}
            >
                <span
                    className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
                />
            </button>
        </div>
    );
};

export default NotificationSettings;
