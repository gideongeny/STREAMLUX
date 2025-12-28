import { FC } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { MdNotifications, MdNotificationsActive, MdNotificationsOff } from 'react-icons/md';
import { toast } from 'react-toastify';

const NotificationRequest: FC = () => {
    const { permission, requestPermission, sendNotification, isSupported } = useNotifications();

    const handleEnable = async () => {
        const result = await requestPermission();
        if (result === 'granted') {
            toast.success("Notifications enabled!");
            sendNotification("StreamLux", {
                body: "You will now receive updates for new episodes and movies!",
            });
        } else {
            toast.error("Notifications denied.");
        }
    };

    if (!isSupported) return null;

    if (permission === 'granted') {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">
                <MdNotificationsActive size={20} />
                <span className="text-sm font-medium">Notifications Active</span>
            </div>
        );
    }

    if (permission === 'denied') {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20" title="Enable in browser settings">
                <MdNotificationsOff size={20} />
                <span className="text-sm font-medium">Notifications Blocked</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleEnable}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg border border-primary/20 transition duration-300"
        >
            <MdNotifications size={20} className="animate-pulse" />
            <span className="text-sm font-medium">Enable Notifications</span>
        </button>
    );
};

export default NotificationRequest;
