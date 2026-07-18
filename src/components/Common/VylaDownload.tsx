import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AiOutlineDownload } from 'react-icons/ai';
import { FiChevronDown, FiLoader, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { addDownload } from '../../store/slice/downloadSlice';
import { buildVidVaultUrl } from '../../utils/vidVaultUrl';
import VidVaultPortal from './VidVaultPortal';

const VYLA_BASE = 'https://missourimonster-vyla.hf.space';

interface VylaDownloadLink {
  url: string;
  quality: string;
  size: string | null;
  format: string;
  server: number;
}

interface VylaDownloadProps {
  tmdbId: string | number;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title: string;
  className?: string;
  compact?: boolean;
  posterPath?: string;
}

const qualityOrder: Record<string, number> = {
  '2160p': 0, '4K': 0,
  '1080p': 1, 'FHD': 1,
  '720p': 2, 'HD': 2,
  '480p': 3, 'SD': 3,
  '360p': 4, 'Unknown': 5,
};

const qualityStyle: Record<string, string> = {
  '4K':    'bg-purple-500/20 text-purple-300 border-purple-500/40',
  '2160p': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  '1080p': 'bg-primary/20 text-primary border-primary/40',
  'FHD':   'bg-primary/20 text-primary border-primary/40',
  '720p':  'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'HD':    'bg-blue-500/20 text-blue-300 border-blue-500/40',
  '480p':  'bg-gray-500/20 text-gray-300 border-gray-500/40',
  '360p':  'bg-gray-600/20 text-gray-400 border-gray-600/40',
};

function deduplicateLinks(links: VylaDownloadLink[]): VylaDownloadLink[] {
  const map = new Map<string, VylaDownloadLink>();
  for (const l of links) {
    const key = `${l.quality}-${l.format}`;
    const existing = map.get(key);
    if (!existing) { map.set(key, l); continue; }
    if (!existing.size && l.size) { map.set(key, l); continue; }
  }
  return Array.from(map.values()).sort(
    (a, b) => (qualityOrder[a.quality] ?? 99) - (qualityOrder[b.quality] ?? 99)
  );
}

const VylaDownload: React.FC<VylaDownloadProps> = ({
  tmdbId, mediaType, season, episode, title, className = '', compact = false, posterPath = ''
}) => {
  const dispatch = useDispatch();
  const [links, setLinks] = useState<VylaDownloadLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showVidVault, setShowVidVault] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const downloadId = mediaType === 'tv'
    ? `${tmdbId}_s${season || 1}_e${episode || 1}`
    : String(tmdbId);

  const registerDownloadIntent = useCallback(() => {
    dispatch(addDownload({
      id: downloadId,
      title,
      media_type: mediaType,
      poster_path: posterPath,
      backdrop_path: posterPath,
      overview: '',
      genre_ids: [],
      original_language: 'en',
      popularity: 0,
      vote_count: 0,
      vote_average: 0,
      status: 'pending',
      progress: 0,
      downloadDate: Date.now(),
    }));
  }, [dispatch, downloadId, title, mediaType, posterPath]);

  useEffect(() => {
    if (!tmdbId) return;
    setLoading(true);
    setError(null);

    const url = mediaType === 'movie'
      ? `${VYLA_BASE}/api/downloads/movie/${tmdbId}`
      : `${VYLA_BASE}/api/downloads/tv/${tmdbId}/${season || 1}/${episode || 1}`;

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        const raw: VylaDownloadLink[] = Array.isArray(data)
          ? data
          : (data.downloads || []);
        const deduped = deduplicateLinks(raw);
        setLinks(deduped);
        if (deduped.length === 0) setError('No direct CDN links found.');
      })
      .catch(err => {
        console.error('[VylaDownload]', err);
        setError('No direct CDN links found.');
      })
      .finally(() => setLoading(false));
  }, [tmdbId, mediaType, season, episode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDownload = (link: VylaDownloadLink) => {
    registerDownloadIntent();
    dispatch(addDownload({
      id: downloadId,
      title,
      media_type: mediaType,
      poster_path: posterPath,
      backdrop_path: posterPath,
      overview: '',
      genre_ids: [],
      original_language: 'en',
      popularity: 0,
      vote_count: 0,
      vote_average: 0,
      status: 'downloading',
      progress: 10,
      downloadDate: Date.now(),
      sourceUrl: link.url,
      size: link.size || undefined,
    }));

    const a = document.createElement('a');
    a.href = link.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Option 1: Downloading ${link.quality} — "${title}"`);
    setIsOpen(false);
  };

  const openVidVault = () => {
    registerDownloadIntent();
    setShowVidVault(true);
    setIsOpen(false);
    toast.info('Option 2: Open VidVault in a new tab for reliable downloads');
  };

  const vidVaultUrl = buildVidVaultUrl(mediaType, tmdbId, season, episode);

  const optionTwoButton = (
    <button
      onClick={openVidVault}
      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[10px] font-black uppercase tracking-widest transition-all"
    >
      <FiExternalLink size={12} />
      Option 2 — VidVault Portal
    </button>
  );

  const panelContent = (
    <>
      <div className="px-3 py-2 border-b border-white/5">
        <p className="text-[9px] font-black text-primary uppercase tracking-widest">Option 1 — Direct CDN</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-4 text-gray-500">
          <FiLoader size={14} className="animate-spin" />
          <span className="text-xs">Scanning CDN servers...</span>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-start gap-2 py-3 px-3 text-red-400">
          <FiAlertCircle size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-xs">{error}</p>
            <p className="text-[10px] text-gray-500 mt-1">Saved to your library. Try Option 2 below.</p>
          </div>
        </div>
      )}

      {!loading && !error && links.length === 0 && (
        <p className="text-center text-gray-500 text-xs py-3 px-2">No direct links — use Option 2</p>
      )}

      {!loading && links.map((link, i) => {
        const style = qualityStyle[link.quality] || 'bg-gray-600/20 text-gray-400 border-gray-600/40';
        return (
          <button
            key={i}
            onClick={() => handleDownload(link)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group"
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wide ${style}`}>
                {link.quality}
              </span>
              <span className="text-[10px] text-gray-500 font-mono uppercase">{link.format}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {link.size && <span className="text-[10px] text-gray-600 font-mono">{link.size}</span>}
              <AiOutlineDownload size={13} className="text-gray-600 group-hover:text-primary transition-colors" />
            </div>
          </button>
        );
      })}

      {!loading && (
        <div className="p-2 pt-1 border-t border-white/5 space-y-2">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Option 2 — VidVault</p>
          {optionTwoButton}
        </div>
      )}
    </>
  );

  if (compact) {
    return (
      <>
        <div ref={dropdownRef} className={`relative ${className}`}>
          <button
            onClick={() => { registerDownloadIntent(); setIsOpen(prev => !prev); }}
            title={loading ? 'Loading downloads...' : `Download ${title}`}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 border ${
              isOpen
                ? 'bg-primary text-black border-primary'
                : 'bg-white/5 text-primary border-white/10 hover:bg-primary/20 hover:border-primary/40'
            }`}
          >
            {loading ? <FiLoader size={13} className="animate-spin" /> : <AiOutlineDownload size={14} />}
          </button>

          {isOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-64 bg-[#111114] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-1.5">{panelContent}</div>
            </div>
          )}
        </div>
        <VidVaultPortal
          isOpen={showVidVault}
          url={vidVaultUrl}
          title={title}
          onClose={() => setShowVidVault(false)}
        />
      </>
    );
  }

  return (
    <>
      <div ref={dropdownRef} className={`relative inline-block ${className}`}>
        <button
          onClick={() => { registerDownloadIntent(); setIsOpen(prev => !prev); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border ${
            isOpen
              ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,107,53,0.4)]'
              : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary hover:text-black'
          }`}
        >
          {loading ? <FiLoader size={14} className="animate-spin" /> : <AiOutlineDownload size={14} />}
          <span>{loading ? 'Loading...' : 'Download'}</span>
          <FiChevronDown size={13} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 bg-[#111114] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <AiOutlineDownload className="text-primary" size={16} />
                <span className="text-white font-black text-xs uppercase tracking-widest">Download</span>
              </div>
              {mediaType === 'tv' && (
                <span className="text-[9px] text-gray-500 font-mono">S{season || 1}E{episode || 1}</span>
              )}
            </div>
            <div className="p-2">{panelContent}</div>
            <div className="px-4 py-2 border-t border-white/5">
              <p className="text-[9px] text-gray-700 text-center uppercase tracking-widest">Powered by CineSu · Vyla API</p>
            </div>
          </div>
        )}
      </div>

      <VidVaultPortal
        isOpen={showVidVault}
        url={vidVaultUrl}
        title={title}
        onClose={() => setShowVidVault(false)}
      />
    </>
  );
};

export default VylaDownload;
