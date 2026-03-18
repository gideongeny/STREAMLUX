/**
 * Push Notification Service for Android
 * Handles FCM integration, notification channels, and user preferences
 */

import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { pushNotificationService as pushService } from './pushNotifications'; // Self-reference for type check if needed
import { db, auth as firebaseAuth } from '../shared/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { safeStorage } from '../utils/safeStorage';

export type NotificationType =
    | 'new_episode'
    | 'download_complete'
    | 'trending_content'
    | 'achievement_unlocked'
    | 'daily_reminder'
    | 'recommendation';

interface NotificationPreferences {
    newEpisodes: boolean;
    downloads: boolean;
    trending: boolean;
    achievements: boolean;
    dailyReminder: boolean;
    recommendations: boolean;
}

class PushNotificationService {
    private isInitialized = false;
    private fcmToken: string | null = null;

    /**
     * Initialize push notifications
     */
    async initialize(): Promise<void> {
        if (!Capacitor.isNativePlatform()) {
            console.log('Push notifications only available on native platforms');
            return;
        }

        if (this.isInitialized) return;

        try {
            // CRITICAL: Check if Firebase is initialized before proceeding.
            // Without google-services.json, FirebaseApp is not initialized and
            // calling PushNotifications.register() will throw IllegalStateException.
            try {
                const { getApps } = await import('firebase/app');
                if (getApps().length === 0) {
                    console.warn('PushNotifications: Firebase is not initialized. Skipping registration. Add google-services.json to enable push notifications.');
                    return;
                }
            } catch (firebaseCheckError) {
                console.warn('PushNotifications: Could not verify Firebase initialization, skipping registration.', firebaseCheckError);
                return;
            }

            // Request permission
            const permStatus = await PushNotifications.requestPermissions();

            if (permStatus.receive === 'granted') {
                // Register with FCM
                await PushNotifications.register();

                // Listen for registration
                await PushNotifications.addListener('registration', (token: Token) => {
                    console.log('Push registration success, token: ' + token.value);
                    this.fcmToken = token.value;
                    this.saveFCMToken(token.value);
                });

                // Listen for registration errors
                await PushNotifications.addListener('registrationError', (error: any) => {
                    console.error('Error on registration: ' + JSON.stringify(error));
                });

                // Listen for push notifications
                await PushNotifications.addListener(
                    'pushNotificationReceived',
                    (notification: PushNotificationSchema) => {
                        console.log('Push received: ' + JSON.stringify(notification));
                        this.handleNotificationReceived(notification);
                    }
                );

                // Listen for notification actions
                await PushNotifications.addListener(
                    'pushNotificationActionPerformed',
                    (notification: ActionPerformed) => {
                        console.log('Push action performed: ' + JSON.stringify(notification));
                        this.handleNotificationAction(notification);
                    }
                );

                this.isInitialized = true;
                this.createNotificationChannels();
            } else {
                console.log('Push notification permission denied');
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    /**
     * Create Android notification channels
     */
    private async createNotificationChannels(): Promise<void> {
        if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;

        // Channels will be created in native Android code
        // This is a placeholder for the channel configuration
        const channels = [
            {
                id: 'new_episodes',
                name: 'New Episodes',
                description: 'Notifications for new episodes of your favorite shows',
                importance: 4, // HIGH
                sound: 'default',
                vibration: true,
            },
            {
                id: 'downloads',
                name: 'Downloads',
                description: 'Download progress and completion notifications',
                importance: 3, // DEFAULT
                sound: 'default',
                vibration: false,
            },
            {
                id: 'trending',
                name: 'Trending Content',
                description: 'Trending movies and shows in your region',
                importance: 2, // LOW
                sound: null,
                vibration: false,
            },
            {
                id: 'achievements',
                name: 'Achievements',
                description: 'Achievement unlock notifications',
                importance: 2, // LOW
                sound: 'achievement',
                vibration: true,
            },
            {
                id: 'daily_reminder',
                name: 'Daily Reminders',
                description: 'Daily engagement and streak reminders',
                importance: 2, // LOW
                sound: null,
                vibration: false,
            },
            {
                id: 'recommendations',
                name: 'Recommendations',
                description: 'Personalized content recommendations',
                importance: 2, // LOW
                sound: null,
                vibration: false,
            },
        ];

        // Store channel configuration for native implementation
        safeStorage.set('notification_channels', JSON.stringify(channels));
    }

    /**
     * Handle received notification
     */
    private handleNotificationReceived(notification: PushNotificationSchema): void {
        // Custom handling based on notification type
        const notificationType = notification.data?.type as NotificationType;

        switch (notificationType) {
            case 'new_episode':
                // Could trigger a UI update or cache refresh
                console.log('New episode notification:', notification.data);
                break;
            case 'download_complete':
                // Update download manager UI
                console.log('Download complete:', notification.data);
                break;
            case 'achievement_unlocked':
                // Show achievement animation
                console.log('Achievement unlocked:', notification.data);
                break;
            default:
                console.log('Generic notification:', notification);
        }
    }

    /**
     * Handle notification action (user tapped notification)
     */
    private handleNotificationAction(action: ActionPerformed): void {
        const data = action.notification.data;
        const actionId = action.actionId;

        // Navigate based on notification type
        if (data.movieId) {
            window.location.href = `/movie/${data.movieId}`;
        } else if (data.tvId) {
            window.location.href = `/tv/${data.tvId}`;
        } else if (data.route) {
            window.location.href = data.route;
        }
    }

    /**
     * Save FCM token to backend
     */
    private async saveFCMToken(token: string): Promise<void> {
        try {
            // 1. Save to local storage for quick access
            safeStorage.set('fcm_token', token);

            // 2. Persist to Firestore if user is logged in
            const user = firebaseAuth.currentUser;
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                
                // Use arrayUnion to store multiple tokens (one for each device)
                await updateDoc(userDocRef, {
                    fcmTokens: arrayUnion(token),
                    lastTokenUpdate: new Date().toISOString()
                }).catch(async (error) => {
                    // If document doesn't exist or field is missing, handle gracefully
                    if (error.code === 'not-found') {
                        // This shouldn't happen as user doc is created on auth, 
                        // but let's be safe.
                        await setDoc(userDocRef, { 
                            fcmTokens: [token],
                            lastTokenUpdate: new Date().toISOString()
                        }, { merge: true });
                    }
                });
                console.log('FCM token persisted to Firestore for user:', user.uid);
            } else {
                console.log('FCM token generated but user not logged in. Token will be synced on next login.');
            }
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    }

    /**
     * Get notification preferences
     */
    getPreferences(): NotificationPreferences {
        const stored = safeStorage.get('notification_preferences');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                safeStorage.remove('notification_preferences');
            }
        }

        // Default: all enabled
        return {
            newEpisodes: true,
            downloads: true,
            trending: true,
            achievements: true,
            dailyReminder: true,
            recommendations: true,
        };
    }

    /**
     * Update notification preferences
     */
    updatePreferences(preferences: Partial<NotificationPreferences>): void {
        const current = this.getPreferences();
        const updated = { ...current, ...preferences };
        safeStorage.set('notification_preferences', JSON.stringify(updated));
    }

    /**
     * Check if notifications are enabled
     */
    async areNotificationsEnabled(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) return false;

        try {
            const permStatus = await PushNotifications.checkPermissions();
            return permStatus.receive === 'granted';
        } catch {
            return false;
        }
    }

    /**
     * Get FCM token
     */
    getFCMToken(): string | null {
        return this.fcmToken || safeStorage.get('fcm_token');
    }

    /**
     * Schedule local notification (for offline features)
     */
    async scheduleLocalNotification(
        title: string,
        body: string,
        data?: any,
        scheduleAt?: Date
    ): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body,
                        id: Math.floor(Math.random() * 10000),
                        schedule: scheduleAt ? { at: scheduleAt } : undefined,
                        extra: data,
                        smallIcon: 'mipmap/ic_launcher', // Use standard app icon
                        largeIcon: data?.imageUrl || undefined,
                        iconColor: '#E50914', // StreamLux Primary Red
                        actionTypeId: 'OPEN_CONTENT',
                        attachments: data?.imageUrl ? [{ id: 'poster', url: data.imageUrl }] : [],
                    }
                ]
            });
            console.log('Local notification scheduled with image:', data?.imageUrl);
        } catch (error) {
            console.error('Error scheduling local notification:', error);
        }
    }
}

export const pushNotificationService = new PushNotificationService();

// Note: Do NOT auto-initialize on app load to avoid startup crashes when Firebase is not configured via google-services.json.
// Initialization should be requested after the app has loaded or by a user setting.
/* 
if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
    pushNotificationService.initialize();
}
*/
