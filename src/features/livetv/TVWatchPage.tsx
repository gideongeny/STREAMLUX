import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hls from 'hls.js';
import { ALL_TV_CHANNELS, TVChannel } from '../../utils/tvChannelMap';
import { FiChevronLeft, FiMenu, FiX, FiInfo, FiZap } from 'react-icons/fi';

const TVWatchPage: React.FC = () => {
  const { channelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentChannel, setCurrentChannel] = useState<TVChannel | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 1. Resolve channel from state or ID
    const found = location.state?.channel || ALL_TV_CHANNELS.find(c => c.id === channelId);
    if (found) {
      setCurrentChannel(found);
    } else {
      navigate('/tv'); // Fallback if channel not found
    }
  }, [channelId, location.state]);

  useEffect(() => {
    let hls: Hls | null = null;
    
    if (currentChannel?.type === 'hls' && videoRef.current) {
      const video = videoRef.current;
      const url = currentChannel.url;

      if (Hls.isSupported()) {
        hls = new Hls({
            xhrSetup: (xhr) => {
                xhr.withCredentials = false;
            }
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      }
    }
    
    return () => {
      if (hls) hls.destroy();
    };
  }, [currentChannel]);

  if (!currentChannel) return null;

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden select-none">
      {/* Dynamic Header */}
      <div className="h-20 bg-[#050505]/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/tv')} 
            className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white uppercase tracking-tighter italic">
              {currentChannel.name}
            </h1>
            <div className="flex items-center gap-3">
              <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                Live Stream • {currentChannel.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`p-3 rounded-2xl border transition-all ${isSidebarOpen ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
            >
                {isSidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden relative">
        {/* Main Player View */}
        <div className={`flex-grow h-full bg-black relative transition-all duration-500`}>
          {currentChannel.type === 'iframe' ? (
            <iframe
              key={currentChannel.url}
              src={currentChannel.url}
              className="w-full h-full border-0 absolute inset-0 bg-black"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full relative group bg-black flex items-center justify-center">
                 <video 
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                />
            </div>
          )}

          {/* Player Info Overlay (auto-hides) */}
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase text-gray-400">
                  4K Secure Stream
              </div>
          </div>
        </div>

        {/* Channel Sidebar (Overlay on mobile, push on desktop) */}
        <AnimatePresence>
            {isSidebarOpen && (
                <motion.div 
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    className="w-[350px] md:w-[400px] h-full bg-[#080808] border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] z-40 flex flex-col"
                >
                    <div className="p-8 border-b border-white/5">
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">More TV</h2>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Cable Hub</h3>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                        {ALL_TV_CHANNELS.filter(c => c.id !== currentChannel.id).map((channel) => (
                            <button
                                key={channel.id}
                                onClick={() => {
                                    setCurrentChannel(channel);
                                    navigate(`/tv/${channel.id}`, { state: { channel }, replace: true });
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all mb-2 group text-left border border-transparent hover:border-white/5"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-all font-black text-xs text-gray-500 group-hover:text-primary">
                                    {channel.name.slice(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">{channel.name}</span>
                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{channel.category}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Connection Info */}
      <div className="h-10 bg-[#050505] border-t border-white/5 flex items-center justify-between px-6 text-[8px] font-black text-gray-600 uppercase tracking-widest">
        <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
                <FiInfo className="w-3 h-3 text-primary" />
                Connection: Secure HLS
            </span>
            <span className="flex items-center gap-2">
                <FiZap className="w-3 h-3 text-yellow-500" />
                Low Latency Active
            </span>
        </div>
        <span>StreamLux Universal Hub v2.0</span>
      </div>
    </div>
  );
};

export default TVWatchPage;
