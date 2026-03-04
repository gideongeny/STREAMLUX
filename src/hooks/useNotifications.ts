import { useState, useEffect } from 'react';

interface NotificationHook {
    permission: NotificationPermission;
    requestPermission: () => Promise<NotificationPermission>;
    sendNotification: (title: string, options?: NotificationOptions) => void;
    isSupported: boolean;
}

export const useNotifications = (): NotificationHook => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setIsSupported(true);
            setPermission(window.Notification.permission);
        }
    }, []);

    const requestPermission = async (): Promise<NotificationPermission> => {
        if (!isSupported) return 'denied';

        try {
            const result = await window.Notification.requestPermission();
            setPermission(result);
            return result;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    };

    const sendNotification = (title: string, options?: NotificationOptions) => {
        if (!isSupported || permission !== 'granted') return;

        try {
            new window.Notification(title, {
                icon: '/icon.png', // Ensure this exists in public
                badge: '/icon.png',
                ...options,
            });
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    return { permission, requestPermission, sendNotification, isSupported };
};
