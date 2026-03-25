import { FC, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { 
  FaDownload, 
  FaAndroid, 
  FaCheckCircle, 
  FaShieldAlt,
  FaMobileAlt,
  FaFilm,
  FaFutbol,
  FaSearch,
  FaBookmark
} from "react-icons/fa";
import { 
  MdSecurity, 
  MdSpeed, 
  MdHighQuality,
  MdCloudDownload,
  MdDevices
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Common/Sidebar";
import { useCurrentViewportView } from "../hooks/useCurrentViewportView";

const Download: FC = () => {
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [latestRelease, setLatestRelease] = useState<{ version: string; downloadUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const response = await fetch("https://api.github.com/repos/gideongeny/STREAMLUX/releases/latest");
        const data = await response.json();
        
        // Find APK asset
        const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith(".apk"));
        
        if (apkAsset) {
          setLatestRelease({
            version: data.tag_name,
            downloadUrl: apkAsset.browser_download_url
          });
        } else {
          // Fallback if no APK is specifically found in assets
          setLatestRelease({
            version: data.tag_name || "Latest",
            downloadUrl: `https://github.com/gideongeny/STREAMLUX/releases/download/${data.tag_name}/app-release.apk`
          });
        }
      } catch (error) {
        console.error("Failed to fetch latest release:", error);
        // Fallback to a generic "latest" link
        setLatestRelease({
          version: "v3.1.0",
          downloadUrl: "https://github.com/gideongeny/STREAMLUX/releases/latest/download/app-release.apk"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRelease();
  }, []);

  const handleDownload = () => {
    const url = latestRelease?.downloadUrl || "https://github.com/gideongeny/STREAMLUX/releases/latest/download/app-release.apk";
    window.location.href = url;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="flex md:hidden justify-between items-center px-5 my-5">
        <Link to="/" className="flex gap-2 items-center">
          <img
            src="/logo.svg"
            alt="StreamLux Logo"
            className="h-10 w-10"
          />
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
          <Sidebar
            isSidebarActive={isSidebarActive}
            onCloseSidebar={() => setIsSidebarActive(false)}
          />
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
            {/* Header Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-16 md:mt-4"
            >
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
                Cinema in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Your Pocket</span>
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                Take the ultimate streaming experience anywhere. Thousands of titles, zero ads, 
                and world-class performance on your Android device.
              </p>
            </motion.div>

            {/* Main Download Section */}
            <div className="max-w-4xl mx-auto">
              {/* Download Button Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative group"
              >
                {/* Accent Glow Layer - ELITE FIX: Added pointer-events-none */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-orange-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 pointer-events-none"></div>
                
                <div className="relative bg-dark-lighten/80 backdrop-blur-3xl rounded-2xl p-8 md:p-12 mb-12 text-center border border-white/5 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-10">
                  <div className="mb-8 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    <FaAndroid className="text-7xl text-primary mx-auto mb-6 relative z-10 drop-shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]" />
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                      StreamLux Pro
                    </h2>
                    <AnimatePresence mode="wait">
                      <motion.p 
                        key={loading ? 'loading' : 'loaded'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-400 mb-4 font-mono text-sm tracking-loose"
                      >
                        {loading ? "SEARCHING RELEASES..." : `VERSION ${latestRelease?.version || "V3.1.0-ELITE"}`}
                      </motion.p>
                    </AnimatePresence>
                    <div className="flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 w-fit mx-auto text-[10px] font-black uppercase text-green-500 tracking-widest">
                      <FaCheckCircle className="text-[12px]" />
                      <span>Certified Latest Build</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <a
                      href={latestRelease?.downloadUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn relative flex items-center justify-center gap-4 px-12 py-6 bg-primary text-black font-black text-xl rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.05] active:scale-95 shadow-[0_20px_50px_-10px_rgba(var(--color-primary-rgb),0.6)] w-full max-w-md cursor-pointer z-20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>
                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0%,_transparent_70%)] pointer-events-none"></div>
                      <FaDownload className="text-3xl relative z-10" />
                      <span className="relative z-10 uppercase tracking-tight">DOWNLOAD APK</span>
                    </a>
                  </div>

                  <p className="text-gray-500 text-xs mt-6 font-medium uppercase tracking-tighter">
                    Direct Secure Link • GitHub Official Proxy
                  </p>

                  <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    <div className="flex items-center gap-2 group/meta cursor-default">
                      <FaShieldAlt className="text-primary group-hover/meta:scale-110 transition" />
                      <span className="group-hover/meta:text-gray-300 transition">BitDefender Safe</span>
                    </div>
                    <div className="flex items-center gap-2 group/meta cursor-default">
                      <MdSecurity className="text-primary group-hover/meta:scale-110 transition" />
                      <span className="group-hover/meta:text-gray-300 transition">Zero Adware</span>
                    </div>
                    <div className="flex items-center gap-2 group/meta cursor-default">
                      <FaMobileAlt className="text-primary group-hover/meta:scale-110 transition" />
                      <span className="group-hover/meta:text-gray-300 transition">Android 5.0+</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Features Grid */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {[
                  { icon: FaFilm, title: "Cinema Library", desc: "Access 40,000+ movies and TV shows from every global studio." },
                  { icon: FaFutbol, title: "Live Stadium", desc: "Premium live sports streaming with real-time analytics and zero lag." },
                  { icon: MdCloudDownload, title: "Offline Vault", desc: "Download any title to your local storage for viewing anywhere, anytime." },
                  { icon: FaSearch, title: "Deep Search", desc: "Advanced AI-driven search to find your next obsession in seconds." },
                  { icon: FaBookmark, title: "Curated Lists", desc: "Save your favorites and sync your progress across all your devices." },
                  { icon: MdDevices, title: "Multi-Source HQ", desc: "Adaptive bitrate streaming with multiple fail-safe server mirrors." }
                ].map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="group bg-dark-lighten/40 backdrop-blur-xl rounded-2xl p-6 border border-white/5 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_10px_30px_-10px_rgba(var(--color-primary-rgb),0.2)]"
                  >
                    <feature.icon className="text-4xl text-primary mb-5 group-hover:scale-110 transition-transform duration-500" />
                    <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Installation Instructions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-dark-lighten/20 backdrop-blur-2xl rounded-2xl p-8 border border-white/5 mb-12"
              >
                <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  Setup Guide
                </h2>
                <div className="space-y-8">
                  {[
                    { step: 1, title: "Authorize Installation", desc: "Enable 'Install unknown apps' in your Android Settings for your preferred browser." },
                    { step: 2, title: "Acquire APK", desc: "Click 'DOWNLOAD APK' above. The system will automatically fetch the latest certified build." },
                    { step: 3, title: "Launch StreamLux", desc: "Open the downloaded file and tap 'Install'. Dive into a world of elite entertainment." }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-black transition-all duration-500">
                        {item.step}
                      </div>
                      <div className="pt-1">
                        <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">
                          {item.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium max-w-xl">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Requirements */}
              <div className="bg-dark-lighten rounded-2xl p-8 border border-gray-800 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <MdSpeed className="text-primary" />
                  Requirements
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold">Android Version</h3>
                      <p className="text-gray-400 text-sm">Android 5.0 (Lollipop) or higher</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold">Storage Space</h3>
                      <p className="text-gray-400 text-sm">50MB free space required</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold">Internet Connection</h3>
                      <p className="text-gray-400 text-sm">Required for streaming content</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 text-xl mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="text-white font-semibold">Permissions</h3>
                      <p className="text-gray-400 text-sm">Internet & Network State</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="bg-gradient-to-r from-primary/10 to-orange-600/10 border border-primary/30 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                  <FaShieldAlt className="text-primary text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-2">Security Note</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Android may show a warning about installing from unknown sources. This is normal for apps distributed outside the Play Store. StreamLux is completely safe to install. We do not collect personal data, and all content is streamed securely.
                    </p>
                  </div>
                </div>
              </div>

              {/* Alternative Download */}
              <div className="text-center">
                <p className="text-gray-400 mb-4">
                  Prefer to use the web version?
                </p>
                <Link
                  to="/"
                  className="text-primary hover:text-primary/80 transition font-semibold"
                >
                  Go to StreamLux Website →
                </Link>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default Download;

