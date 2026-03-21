import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDownload, FaTimes, FaCodeBranch } from 'react-icons/fa';
import { Capacitor } from '@capacitor/core';
import packageJson from '../../../package.json';

const CURRENT_VERSION = packageJson.version || "1.2.0";

interface ReleaseData {
  tag_name: string;
  body: string;
  assets: { browser_download_url: string }[];
}

const AppUpdater: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<ReleaseData | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Only check for updates if running as an Android APK (Native App)
    if (!Capacitor.isNativePlatform()) return;

    const checkUpdate = async () => {
      try {
        const res = await fetch('https://api.github.com/repos/gideongeny/STREAMLUX/releases/latest');
        if (!res.ok) return;
        
        const data: ReleaseData = await res.json();
        const latestVersion = data.tag_name.replace('v', '').replace('V', '');
        
        // Semantic version comparison
        if (latestVersion.localeCompare(CURRENT_VERSION, undefined, { numeric: true, sensitivity: 'base' }) > 0) {
          setUpdateAvailable(data);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Failed to check for updates:", error);
      }
    };

    // Delay check slightly to prevent blocking initial boot up sequence
    const timer = setTimeout(checkUpdate, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-[#1a1a2e] border border-primary/30 w-full max-w-sm rounded-3xl p-6 shadow-[0_0_40px_rgba(255,107,0,0.15)] relative overflow-hidden"
          >
            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-orange-500"></div>
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4 mt-2">
              <div className="p-3 bg-primary/20 text-primary rounded-xl">
                <FaCodeBranch size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white leading-tight">Update Available</h3>
                <p className="text-primary font-bold text-sm">Version {updateAvailable.tag_name}</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 mb-6 max-h-[160px] overflow-y-auto text-sm text-gray-300 scrollbar-thin scrollbar-thumb-gray-700">
              <h4 className="font-bold text-white mb-2 uppercase text-[10px] tracking-widest text-primary">What's New</h4>
              <p className="whitespace-pre-wrap leading-relaxed">{updateAvailable.body}</p>
            </div>

            <a 
              href={updateAvailable.assets[0]?.browser_download_url || "https://github.com/gideongeny/STREAMLUX/releases/latest"}
              className="w-full bg-gradient-to-r from-primary to-orange-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95"
              onClick={() => {
                setShowModal(false);
                // The browser will handle the direct .apk file download natively
              }}
            >
              <FaDownload />
              Download & Install Update
            </a>
            
            <button 
              onClick={() => setShowModal(false)}
              className="w-full mt-3 py-3 text-sm text-gray-400 font-bold hover:text-white transition-colors"
            >
              Maybe Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppUpdater;
