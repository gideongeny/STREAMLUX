import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Track } from '../../store/slice/musicSlice';
import axios from 'axios';

interface LyricsViewProps {
  track: Track;
  currentTime: number;
}

interface LyricLine {
  time: number;
  text: string;
}

const LyricsView: React.FC<LyricsViewProps> = ({ track, currentTime }) => {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLyrics = async () => {
      setLoading(true);
      setError(null);
      setLyrics([]);
      
      try {
        // Aggressively clean up YouTube titles for better matching
        let cleanTitle = track.title
          .replace(/\(Official.*?\)/gi, '')
          .replace(/\[.*?\]/g, '')
          .replace(/\(Lyric.*?\)/gi, '')
          .replace(/\(Music Video\)/gi, '')
          .replace(/\(Video\)/gi, '')
          .replace(/\(Audio\)/gi, '')
          .replace(/Official Video/gi, '')
          .replace(/Official Audio/gi, '')
          .replace(/Visualizer/gi, '')
          .replace(/feat\..*/gi, '')
          .replace(/ft\..*/gi, '');

        let cleanArtist = track.artist.replace(/Topic|VEVO/gi, '').trim();

        // Handle "Artist - Title" format common on YouTube
        if (cleanTitle.includes('-')) {
            const parts = cleanTitle.split('-');
            cleanArtist = parts[0].trim();
            cleanTitle = parts[1].trim();
        }
        
        cleanTitle = cleanTitle.trim();
        if (!cleanTitle) cleanTitle = track.title; // Fallback

        try {
            // First attempt: Exact match
            const res = await axios.get(`https://lrclib.net/api/get`, {
              params: { track_name: cleanTitle, artist_name: cleanArtist },
              timeout: 4000
            });
            
            if (!isMounted) return;

            if (res.data?.syncedLyrics) {
              setLyrics(parseLRC(res.data.syncedLyrics));
              return;
            } else if (res.data?.plainLyrics) {
              setLyrics([{ time: 0, text: res.data.plainLyrics }]);
              return;
            }
        } catch (exactErr: any) {
            // If exact match fails (e.g. 404), fallback to broad search
            if (!isMounted) return;
            
            const searchRes = await axios.get(`https://lrclib.net/api/search`, {
               params: { q: `${cleanArtist} ${cleanTitle}` },
               timeout: 5000
            });

            if (searchRes.data && searchRes.data.length > 0) {
               // Find first result with synced lyrics, or just take the first
               const bestMatch = searchRes.data.find((item: any) => item.syncedLyrics) || searchRes.data[0];
               
               if (bestMatch.syncedLyrics) {
                  setLyrics(parseLRC(bestMatch.syncedLyrics));
                  return;
               } else if (bestMatch.plainLyrics) {
                  setLyrics([{ time: 0, text: bestMatch.plainLyrics }]);
                  return;
               }
            }
            
            throw new Error("No match found in search fallback.");
        }
      } catch (err) {
        console.error("Failed to fetch lyrics:", err);
        if (isMounted) setError("No lyrics found for this track.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    if (track) fetchLyrics();

    return () => { isMounted = false; };
  }, [track?.id]);

  // LRC Parser function
  const parseLRC = (lrcString: string): LyricLine[] => {
    const lines = lrcString.split('\n');
    const parsedLines: LyricLine[] = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    for (const line of lines) {
      const match = line.match(timeRegex);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const milliseconds = parseInt(match[3], 10);
        // Convert to total seconds
        const time = minutes * 60 + seconds + (milliseconds / (match[3].length === 2 ? 100 : 1000));
        const text = line.replace(timeRegex, '').trim();
        if (text) parsedLines.push({ time, text });
      }
    }
    return parsedLines;
  };

  // Find the currently active line
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time && (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time)) {
      activeIndex = i;
      break;
    }
  }

  // Auto-scroll logic
  useEffect(() => {
    if (activeIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeIndex]);

  if (loading) return <div className="flex-1 flex items-center justify-center p-8 text-primary font-bold tracking-widest uppercase animate-pulse">Loading Lyrics...</div>;
  if (error) return <div className="flex-1 flex items-center justify-center p-8 text-gray-500 font-bold tracking-widest uppercase text-center">{error}</div>;

  const isPlainLyrics = lyrics.length === 1 && lyrics[0].time === 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-8 py-20 space-y-8 scrollbar-hide"
      >
        {isPlainLyrics ? (
          <p className="text-xl md:text-2xl font-black text-white/80 leading-relaxed whitespace-pre-wrap uppercase tracking-tighter text-center">
            {lyrics[0].text}
          </p>
        ) : (
          lyrics.map((line, index) => {
            const isActive = index === activeIndex;
            const isPassed = index < activeIndex;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`transition-all duration-500 ${isActive ? 'scale-110 origin-left' : 'scale-100'} cursor-pointer`}
              >
                <p className={`text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight ${isActive ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]' : isPassed ? 'text-white/40' : 'text-white/20'}`}>
                  {line.text}
                </p>
              </motion.div>
            );
          })
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
    </div>
  );
};

export default LyricsView;
