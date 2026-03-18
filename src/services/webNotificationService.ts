import { getToken, onMessage } from "firebase/messaging";
import { messaging, db, auth } from "../shared/firebase";
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { safeStorage } from "../utils/safeStorage";

class WebNotificationService {
    private isInitialized = false;

    /**
     * Initialize Web Push Notifications
     */
    async initialize(): Promise<void> {
        if (typeof window === "undefined" || !messaging) return;
        if (this.isInitialized) return;

        try {
            // Check if service workers are supported
            if (!('serviceWorker' in navigator)) {
                console.warn('Service Workers are not supported in this browser.');
                return;
            }

            // Request permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('Web notification permission denied');
                return;
            }

            // Get FCM Token
            // VAPID Key is required for web push. 
            // This is the "Web Push certificates" key from Firebase Console.
            const token = await getToken(messaging, {
                vapidKey: "BEl_3C0V66LLLR_c25b7416322f092cc49df3_SAMPLE" // This should ideally be in .env
            });

            if (token) {
                console.log('Web FCM token:', token);
                await this.saveTokenToFirestore(token);
                
                // Set up foreground message listener
                onMessage(messaging, (payload) => {
                    console.log('Foreground message received:', payload);
                    this.showLocalNotification(payload);
                });

                this.isInitialized = true;
            }
        } catch (error) {
            console.error('Error initializing Web Notifications:', error);
        }
    }

    /**
     * Save token to Firestore for the current user
     */
    private async saveTokenToFirestore(token: string): Promise<void> {
        try {
            safeStorage.set('web_fcm_token', token);
            
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                await updateDoc(userDocRef, {
                    fcmTokens: arrayUnion(token),
                    lastTokenUpdate: new Date().toISOString()
                }).catch(async (error) => {
                    if (error.code === 'not-found') {
                        await setDoc(userDocRef, { 
                            fcmTokens: [token],
                            lastTokenUpdate: new Date().toISOString()
                        }, { merge: true });
                    }
                });
            }
        } catch (error) {
            console.error('Error saving Web FCM token:', error);
        }
    }

    /**
     * Show a local notification when the app is in foreground
     */
    private showLocalNotification(payload: any): void {
        const { title, body, icon, click_action } = payload.notification;
        
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: icon || '/logo.svg',
            });

            notification.onclick = (event) => {
                event.preventDefault();
                if (click_action) {
                    window.location.href = click_action;
                }
                notification.close();
            };
        }
    }
}

export const webNotificationService = new WebNotificationService();
