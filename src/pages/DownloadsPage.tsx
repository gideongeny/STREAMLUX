import { FC, useState, useEffect } from 'react';
import Title from '../components/Common/Title';
import Sidebar from '../components/Common/Sidebar';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

// Define the shape of our scraped data
interface DownloadItem {
    title: string;
    url: string;
    source: 'FzMovies' | 'NetNaija' | 'O2TvSeries';
    category?: string;
    quality?: string;
    date?: string;
}

const DownloadsPage: FC = () => {
    const [data, setData] = useState<DownloadItem[]>([]);
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [filter, setFilter] = useState<'All' | 'FzMovies' | 'NetNaija' | 'O2TvSeries'>('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        // Load the JSON data
        // In a real build, this file must exist. We handle the case where it might be missing nicely.
        import('../data/downloads.json')
            .then((module) => {
                // Handle both standard JSON array and potentially wrapped generic structure
                const items = (module.default || module) as DownloadItem[];
                setData(items);
            })
            .catch((err) => {
                console.warn('Downloads data not found:', err);
                setData([]);
            });
    }, []);

    const filteredData = data.filter(item => {
        const matchesSource = filter === 'All' || item.source === filter;
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
        return matchesSource && matchesSearch;
    });

    return (
        <>
            <Title value="Direct Downloads | StreamLux" />

            <div className="flex md:hidden justify-between items-center px-5 my-5">
                <Link to="/" className="flex gap-2 items-center">
                    <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
                    <p className="text-xl text-white font-medium tracking-wider uppercase">
                        Stream<span className="text-primary">Lux</span>
                    </p>
                </Link>
                <button onClick={() => setIsSidebarActive((prev) => !prev)}>
                    <GiHamburgerMenu size={25} />
                </button>
            </div>

            <div className="flex items-start relative bg-[#141414] min-h-screen">
                <Sidebar
                    onCloseSidebar={() => setIsSidebarActive(false)}
                    isSidebarActive={isSidebarActive}
                />

                <div className="flex-grow md:pt-10 pt-4 px-4 md:px-8 pb-10 min-w-0">
                    <h1 className="text-3xl text-white font-bold mb-6 flex items-center gap-3">
                        <FaDownload className="text-primary" /> Direct Downloads
                    </h1>

                    <p className="text-gray-400 mb-8 max-w-2xl">
                        Browse and download the latest movies and series directly from our partner sources.
                        <strong>Note:</strong> content is updated daily.
                    </p>

                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <input
                            type="text"
                            placeholder="Search downloads..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-dark-lighten text-white px-4 py-3 rounded-lg flex-grow outline-none focus:ring-2 focus:ring-primary"
                        />

                        <div className="flex gap-2 overflows-x-auto pb-2 md:pb-0">
                            {['All', 'FzMovies', 'NetNaija', 'O2TvSeries'].map((src) => (
                                <button
                                    key={src}
                                    onClick={() => setFilter(src as any)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap transition ${filter === src ? 'bg-primary text-black font-bold' : 'bg-dark-lighten text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    {src}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {data.length === 0 ? (
                        <div className="text-center py-20 bg-dark-lighten rounded-xl border border-dashed border-gray-700">
                            <p className="text-gray-400 text-lg mb-2">No downloads available yet.</p>
                            <p className="text-sm text-gray-500">Run the scraper script to populate this list.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredData.map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-dark-lighten p-4 rounded-xl hover:bg-gray-800 transition group border border-transparent hover:border-white/10 flex flex-col justify-between h-full"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${item.source === 'NetNaija' ? 'bg-green-900 text-green-300' :
                                                    item.source === 'FzMovies' ? 'bg-blue-900 text-blue-300' :
                                                        'bg-purple-900 text-purple-300'
                                                }`}>
                                                {item.source}
                                            </span>
                                            {item.quality && <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-1 rounded">{item.quality}</span>}
                                        </div>

                                        <h3 className="text-white font-medium leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 mt-2 flex items-center justify-between text-sm text-gray-400">
                                        <span>{item.date || 'Recently Added'}</span>
                                        <FaExternalLinkAlt size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DownloadsPage;
