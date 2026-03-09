import { FC, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdNotifications, MdNotificationsNone, MdClose, MdMovieFilter, MdSportsSoccer, MdNewReleases } from 'react-icons/md';
import { Link } from 'react-router-dom';

interface Notification {
    id: string;
    type: 'new_release' | 'sports' | 'trending' | 'reminder';
    title: string;
    body: string;
    time: string;
    read: boolean;
    link?: string;
    icon?: string;
}

const DEMO_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'new_release',
        title: '🎬 New Release Today',
        body: 'Highly anticipated titles are now streaming on StreamLux.',
        time: '2 min ago',
        read: false,
        link: '/',
    },
    {
        id: '2',
        type: 'sports',
        title: '⚽ Match Starting Soon',
        body: 'Premier League: Liverpool vs Man City kicks off in 30 minutes.',
        time: '5 min ago',
        read: false,
        link: '/?tab=sports',
    },
    {
        id: '3',
        type: 'trending',
        title: '🔥 Trending Right Now',
        body: '10 titles are going viral globally. See what everyone is watching.',
        time: '1 hr ago',
        read: true,
        link: '/explore',
    },
    {
        id: '4',
        type: 'reminder',
        title: '📅 New Episodes Available',
        body: 'Your saved shows have new episodes ready to binge.',
        time: '3 hrs ago',
        read: true,
        link: '/bookmarked',
    },
];

const NotificationBell: FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
    const [isPulsing, setIsPulsing] = useState(true);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const pulse = setInterval(() => {
            setIsPulsing(p => !p);
        }, 2000);
        return () => clearInterval(pulse);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isOpen]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'new_release': return <MdMovieFilter className="text-primary" size={18} />;
            case 'sports': return <MdSportsSoccer className="text-green-400" size={18} />;
            case 'trending': return <MdNewReleases className="text-orange-400" size={18} />;
            default: return <MdNotifications className="text-blue-400" size={18} />;
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                id="notification-bell"
                aria-label="Notifications"
                onClick={() => { setIsOpen(o => !o); }}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
            >
                {unreadCount > 0 ? (
                    <MdNotifications size={22} className="text-white" />
                ) : (
                    <MdNotificationsNone size={22} className="text-gray-400" />
                )}

                {/* Unread Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-black ${isPulsing ? 'ring-2 ring-primary/40' : ''} transition-all duration-700`}
                        >
                            {unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute left-0 rtl:left-auto rtl:right-0 top-12 w-80 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                            <span className="text-white font-bold text-sm">Notifications</span>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-[10px] text-primary hover:underline font-semibold">
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                            <AnimatePresence>
                                {notifications.length === 0 ? (
                                    <div className="py-10 text-center text-gray-500 text-sm">No notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <motion.div
                                            key={n.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className={`flex gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer group ${!n.read ? 'bg-primary/5' : ''}`}
                                        >
                                            <div className="flex-shrink-0 mt-0.5 w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link to={n.link || '/'} onClick={() => setIsOpen(false)}>
                                                    <p className={`text-xs font-semibold line-clamp-1 ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.title}</p>
                                                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{n.body}</p>
                                                    <p className="text-[10px] text-gray-600 mt-1">{n.time}</p>
                                                </Link>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                                className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-600 hover:text-white transition"
                                            >
                                                <MdClose size={14} />
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 border-t border-white/10 text-center">
                            <Link
                                to="/settings"
                                onClick={() => setIsOpen(false)}
                                className="text-[11px] text-gray-500 hover:text-primary transition"
                            >
                                Manage notification preferences →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
