import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { MdDownload, MdBookmarkBorder, MdHistory, MdPlaylistPlay } from 'react-icons/md';

const LibraryNav: FC = () => {
    const tabs = [
        { label: 'Downloads', path: '/library', icon: <MdDownload size={20} /> },
        { label: 'Watchlist', path: '/watchlist', icon: <MdPlaylistPlay size={20} /> },
        { label: 'Bookmarked', path: '/bookmarked', icon: <MdBookmarkBorder size={20} /> },
        { label: 'History', path: '/history', icon: <MdHistory size={20} /> },
    ];

    return (
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar mb-8 pb-2">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.path}
                    to={tab.path}
                    end={tab.path === '/library'}
                    className={({ isActive }) => `
                        flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 font-black uppercase tracking-widest text-xs whitespace-nowrap
                        ${isActive 
                            ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,107,53,0.3)]' 
                            : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'}
                    `}
                >
                    {tab.icon}
                    {tab.label}
                </NavLink>
            ))}
        </div>
    );
};

export default LibraryNav;
