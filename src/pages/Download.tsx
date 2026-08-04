import { FC, useState } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { MdSpeed, MdHighQuality, MdCloudDownload } from "react-icons/md";
import { motion } from "framer-motion";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Common/Sidebar";
import { useCurrentViewportView } from "../hooks/useCurrentViewportView";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.streamlux.app.mobile&pcampaignid=web_share";

const Download: FC = () => {
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  return (
    <>
      {/* Mobile Header */}
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

      <div className="flex items-start">
        {isMobile && (
          <Sidebar isSidebarActive={isSidebarActive} onCloseSidebar={() => setIsSidebarActive(false)} />
        )}
        {!isMobile && <Sidebar isSidebarActive={true} onCloseSidebar={() => {}} />}
        
        {/* ELITE VOLUMETRIC BACKGROUND GLOWS */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/5 rounded-full blur-[150px]" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        </div>

        <div className="flex-1 min-h-screen bg-dark md:pt-7 pt-0 pb-7 relative z-10 overflow-x-hidden">
          <div className="container mx-auto px-4 py-8 md:pl-8">
            
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 mt-10 md:mt-20">
              
              {/* Left Column: Copy & CTA */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex-1 text-center lg:text-left z-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mb-8 text-[11px] font-black uppercase text-green-500 tracking-widest">
                  <FaCheckCircle className="text-[14px]" />
                  <span>Now available on Google Play</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
                  Carry the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Cinema</span> in Your Pocket.
                </h1>
                
                <p className="text-gray-400 max-w-xl mx-auto lg:mx-0 text-lg md:text-xl leading-relaxed mb-10 font-medium">
                  Thousands of movies, live sports, and TV shows. Zero ads. Seamless streaming on any Android device.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-green-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <img 
                      src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" 
                      alt="Get it on Google Play" 
                      className="h-20 relative z-10 rounded-2xl"
                    />
                  </a>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-bold uppercase tracking-widest">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-dark-lighten border-2 border-dark flex items-center justify-center"><FaStar className="text-yellow-500 text-[10px]" /></div>
                      <div className="w-8 h-8 rounded-full bg-dark-lighten border-2 border-dark flex items-center justify-center"><FaStar className="text-yellow-500 text-[10px]" /></div>
                      <div className="w-8 h-8 rounded-full bg-dark-lighten border-2 border-dark flex items-center justify-center"><FaStar className="text-yellow-500 text-[10px]" /></div>
                    </div>
                    <span>Highly Rated</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Visual Showcase */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="flex-1 relative w-full max-w-lg"
              >
                {/* Decorative backdrop for the visual */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
                
                {/* 3D App Preview Card */}
                <div className="relative bg-dark-lighten/80 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] rotate-[-2deg] hover:rotate-0 transition-transform duration-700">
                  <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                    <img src="/logo.svg" alt="Logo" className="w-12 h-12" />
                    <div className="text-right">
                      <p className="text-white font-black text-xl uppercase tracking-tighter">StreamLux Pro</p>
                      <p className="text-primary font-bold text-xs uppercase tracking-widest">Official Android App</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-5 group">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                        <MdSpeed size={28} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Hyper-Fast Streaming</h4>
                        <p className="text-gray-500 text-sm">Adaptive bitrate technology</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-5 group">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-colors duration-300">
                        <MdHighQuality size={28} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">4K HDR Support</h4>
                        <p className="text-gray-500 text-sm">Crystal clear visuals</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-5 group">
                      <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-colors duration-300">
                        <MdCloudDownload size={28} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Offline Vault</h4>
                        <p className="text-gray-500 text-sm">Download and watch anywhere</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default Download;
