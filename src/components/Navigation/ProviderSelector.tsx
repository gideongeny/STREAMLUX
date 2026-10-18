import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSearch } from 'react-icons/bi';
import { MdClose, MdCheckCircle, MdBolt, MdFilterList } from 'react-icons/md';
import { providerCatalog } from '../../services/providers/providerCatalog';
import { ProviderExtension } from '../../services/providers/types';

interface ProviderSelectorProps {
    className?: string;
    onProviderChange?: (provider: ProviderExtension) => void;
}

const ProviderSelector: React.FC<ProviderSelectorProps> = ({ className = '', onProviderChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeProvider, setActiveProvider] = useState<ProviderExtension>(() => providerCatalog.getActiveProvider());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'global' | 'fast' | 'scraper'>('all');

    const allProviders = useMemo(() => providerCatalog.getAllProviders(), []);

    useEffect(() => {
        const handleUpdate = () => {
            setActiveProvider(providerCatalog.getActiveProvider());
        };
        window.addEventListener('streamlux:provider-changed', handleUpdate);
        return () => window.removeEventListener('streamlux:provider-changed', handleUpdate);
    }, []);

    const filteredProviders = useMemo(() => {
        return allProviders.filter((p) => {
            const matchesSearch = p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.value.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (selectedCategory === 'all') return true;
            if (selectedCategory === 'global') return p.type === 'global';
            if (selectedCategory === 'scraper') return p.type !== 'global';
            if (selectedCategory === 'fast') return ['autoEmbed', 'drive', 'vega', '4khdhub', 'multi'].includes(p.value);
            return true;
        });
    }, [allProviders, searchQuery, selectedCategory]);

    const handleSelect = (provider: ProviderExtension) => {
        providerCatalog.setActiveProvider(provider.value);
        setActiveProvider(provider);
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('streamlux:provider-changed', { detail: provider }));
        if (onProviderChange) onProviderChange(provider);
    };

    return (
        <>
            {/* Navbar Provider Trigger Pill */}
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF6B35]/20 to-[#FF6B35]/5 hover:from-[#FF6B35]/30 hover:to-[#FF6B35]/15 border border-[#FF6B35]/30 hover:border-[#FF6B35]/60 transition-all duration-300 group shadow-[0_0_15px_rgba(255,107,53,0.15)] shrink-0 ${className}`}
                title="Switch Vega Provider"
            >
                <div className="w-5 h-5 rounded-full overflow-hidden bg-black/60 flex items-center justify-center shrink-0 border border-white/10">
                    {activeProvider.icon ? (
                        <img
                            src={activeProvider.icon}
                            alt={activeProvider.display_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) parent.innerHTML = '<span class="text-[9px] text-[#FF6B35] font-black">⚡</span>';
                            }}
                        />
                    ) : (
                        <MdBolt size={13} className="text-[#FF6B35]" />
                    )}
                </div>

                <div className="flex flex-col text-left">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#FF6B35]">Provider</span>
                    <span className="text-[11px] font-bold text-white group-hover:text-[#FF6B35] transition-colors leading-tight truncate max-w-[100px] md:max-w-[120px]">
                        {activeProvider.display_name}
                    </span>
                </div>

                <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors ml-0.5">▾</span>
            </button>

            {/* Provider Modal / Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-md"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-2xl max-h-[85vh] bg-[#0c0d12] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(255,107,53,0.15)] overflow-hidden flex flex-col z-10"
                        >
                            {/* Modal Header */}
                            <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
                                            <MdBolt size={18} />
                                        </div>
                                        <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                                            STREAMLUX <span className="text-[#FF6B35]">PROVIDERS</span>
                                        </h2>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-0.5">
                                        Choose from 36 direct ad-free Vega stream engines & catalogs
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    <MdClose size={18} />
                                </button>
                            </div>

                            {/* Search & Category Filter */}
                            <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#FF6B35]/50 transition-colors">
                                    <BiSearch size={18} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search providers (e.g. MultiStream, MoviesDrive, Vega, 4khd)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-transparent outline-none text-white text-xs w-full placeholder-gray-500 font-medium"
                                        autoFocus
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white">
                                            <MdClose size={14} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-all ${
                                            selectedCategory === 'all'
                                                ? 'bg-[#FF6B35] text-white shadow-[0_0_12px_rgba(255,107,53,0.4)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        All ({allProviders.length})
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('fast')}
                                        className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-all ${
                                            selectedCategory === 'fast'
                                                ? 'bg-[#FF6B35] text-white shadow-[0_0_12px_rgba(255,107,53,0.4)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        ⚡ Recommended
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('global')}
                                        className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-all ${
                                            selectedCategory === 'global'
                                                ? 'bg-[#FF6B35] text-white shadow-[0_0_12px_rgba(255,107,53,0.4)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        Global
                                    </button>
                                    <button
                                        onClick={() => setSelectedCategory('scraper')}
                                        className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-all ${
                                            selectedCategory === 'scraper'
                                                ? 'bg-[#FF6B35] text-white shadow-[0_0_12px_rgba(255,107,53,0.4)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        Scrapers & 4K
                                    </button>
                                </div>
                            </div>

                            {/* Providers Grid */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {filteredProviders.map((provider) => {
                                    const isActive = provider.value === activeProvider.value;
                                    return (
                                        <button
                                            key={provider.value}
                                            onClick={() => handleSelect(provider)}
                                            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${
                                                isActive
                                                    ? 'bg-[#FF6B35]/15 border-[#FF6B35] shadow-[0_0_20px_rgba(255,107,53,0.2)]'
                                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/15'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                                                    {provider.icon ? (
                                                        <img
                                                            src={provider.icon}
                                                            alt={provider.display_name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const parent = e.currentTarget.parentElement;
                                                                if (parent) parent.innerHTML = '<span class="text-xs text-[#FF6B35] font-black">⚡</span>';
                                                            }}
                                                        />
                                                    ) : (
                                                        <MdBolt size={18} className="text-[#FF6B35]" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <h4 className="text-xs font-bold text-white group-hover:text-[#FF6B35] transition-colors truncate">
                                                            {provider.display_name}
                                                        </h4>
                                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-mono">
                                                            v{provider.version}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 capitalize">
                                                        {provider.type || 'direct'} • Direct Stream
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0 pl-2">
                                                {isActive ? (
                                                    <MdCheckCircle size={20} className="text-[#FF6B35]" />
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border border-white/20 group-hover:border-white/40" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}

                                {filteredProviders.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-500 text-xs">
                                        No providers found matching "{searchQuery}"
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-3 border-t border-white/10 bg-black/40 flex items-center justify-between text-[11px] text-gray-400 px-6">
                                <span>Active: <strong className="text-white">{activeProvider.display_name}</strong></span>
                                <span className="text-[10px] text-[#FF6B35] uppercase font-black tracking-wider">No ads • Direct HLS</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ProviderSelector;
