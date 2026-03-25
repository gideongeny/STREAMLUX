import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import { LEAGUE_STREAMS } from "../../shared/leagueStreams";

interface LeagueStreamEmbedProps {
    leagueId: string;
}

const LeagueStreamEmbed = ({ leagueId }: LeagueStreamEmbedProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Select stream with dynamic fallback based on league type if not explicitly mapped
    const stream: { title: string; type: 'iframe' | 'hls'; src: string } = LEAGUE_STREAMS[leagueId] || 
        (leagueId.includes('soccer') || leagueId.includes('football') ? LEAGUE_STREAMS.default_fox : LEAGUE_STREAMS.default_espn);

    useEffect(() => {
        if (stream.type === 'hls' && videoRef.current) {
            const video = videoRef.current;
            const hls = new Hls();

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream.src;
            } else if (Hls.isSupported()) {
                hls.loadSource(stream.src);
                hls.attachMedia(video);
            }

            return () => {
                hls.destroy();
            };
        }
    }, [stream]);

    if (!stream) return null;

    return (
        <div className="w-full max-w-4xl mx-auto font-sans overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl bg-dark-lighten/20 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur-md px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <h3 className="m-0 text-white font-black uppercase tracking-tighter text-sm md:text-base">
                        {stream.title}
                    </h3>
                </div>
                <span className="text-[10px] font-black text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 uppercase tracking-widest">
                    Live Arena
                </span>
            </div>

            {/* Player Container */}
            <div className="relative aspect-video bg-black group">
                {stream.type === 'iframe' ? (
                    <iframe
                        src={stream.src}
                        className="absolute top-0 left-0 w-full h-full border-0"
                        allowFullScreen
                        allow="autoplay;encrypted-media;picture-in-picture"
                        title={stream.title}
                    />
                ) : (
                    <video
                        ref={videoRef}
                        controls
                        autoPlay
                        className="absolute top-0 left-0 w-full h-full"
                    />
                )}
                
                {/* Overlay Hover Effect */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            {/* Footer */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur-md px-6 py-3 text-center border-t border-white/5">
                <a
                    href="https://StreamSports99.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] decoration-primary/30 underline-offset-4 hover:underline"
                >
                    Powered by StreamSports99
                </a>
            </div>
        </div>
    );
};

export default LeagueStreamEmbed;
