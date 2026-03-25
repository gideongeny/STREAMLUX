import { safeStorage } from "../utils/safeStorage";

export interface Notification {
    id: string;
    type: 'new_release' | 'sports' | 'trending' | 'reminder';
    title: string;
    body: string;
    time: string;
    read: boolean;
    link?: string;
    icon?: string;
}

const STORAGE_KEY = 'streamlux_notifications';

type Listener = (notifications: Notification[]) => void;
const listeners: Listener[] = [];

export const notificationHub = {
    getNotifications: (): Notification[] => {
        return safeStorage.getParsed<Notification[]>(STORAGE_KEY, []);
    },

    add: (notification: Omit<Notification, 'id' | 'read' | 'time'>) => {
        const current = notificationHub.getNotifications();
        const newNotif: Notification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            read: false,
            time: 'Just now'
        };

        const updated = [newNotif, ...current].slice(0, 30); // Keep last 30
        safeStorage.set(STORAGE_KEY, JSON.stringify(updated));
        notificationHub.notify(updated);
    },

    markAsRead: (id: string) => {
        const current = notificationHub.getNotifications();
        const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
        safeStorage.set(STORAGE_KEY, JSON.stringify(updated));
        notificationHub.notify(updated);
    },

    markAllAsRead: () => {
        const current = notificationHub.getNotifications();
        const updated = current.map(n => ({ ...n, read: true }));
        safeStorage.set(STORAGE_KEY, JSON.stringify(updated));
        notificationHub.notify(updated);
    },

    delete: (id: string) => {
        const current = notificationHub.getNotifications();
        const updated = current.filter(n => n.id !== id);
        safeStorage.set(STORAGE_KEY, JSON.stringify(updated));
        notificationHub.notify(updated);
    },

    subscribe: (listener: Listener) => {
        listeners.push(listener);
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    },

    notify: (notifications: Notification[]) => {
        listeners.forEach(l => l(notifications));
    }
};
