import { FC, useState } from "react";
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
  MdCloudDownload
} from "react-icons/md";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Common/Sidebar";
import { useCurrentViewportView } from "../hooks/useCurrentViewportView";

const Download: FC = () => {
  const { isMobile } = useCurrentViewportView();
  const [isSidebarActive, setIsSidebarActive] = useState(false);

  const handleDownload = () => {
    // Open specific GitHub release page in new tab
    window.open("https://github.com/gideongeny/STREAMLUX/releases/tag/V1.00", "_blank");
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

        <div className="flex-1 min-h-screen bg-dark md:pt-7 pt-0 pb-7">
          <div className="container mx-auto px-4 py-8 md:pl-8">
            {/* Header Section */}
            <div className="text-center mb-12 md:mt-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Download StreamLux for Android
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Watch thousands of movies, TV shows, and live sports on your Android device - completely free!
              </p>
            </div>

            {/* Main Download Section */}
            <div className="max-w-4xl mx-auto">
              {/* Download Button Card */}
              <div className="bg-dark-lighten rounded-2xl p-8 md:p-12 mb-8 text-center border border-gray-800 shadow-2xl">
                <div className="mb-6">
                  <FaAndroid className="text-6xl text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-2">
                    StreamLux Android App
                  </h2>
                  <p className="text-gray-400 mb-4">Version 1.0.0</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <FaCheckCircle className="text-green-500" />
                    <span>Latest Version</span>
                  </div>
                </div>

                <a
                  href="https://github.com/gideongeny/STREAMLUX/releases/tag/V1.00"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload();
                  }}
                  className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold py-4 px-8 rounded-xl text-lg md:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-primary/50 flex items-center gap-3 mx-auto cursor-pointer inline-block"
                >
                  <FaDownload className="text-2xl" />
                  <span>Download APK</span>
                </a>

                <p className="text-gray-400 text-sm mt-4">
                  Click to download from GitHub Releases
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <FaShieldAlt className="text-primary" />
                    <span>100% Safe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdSecurity className="text-primary" />
                    <span>No Ads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMobileAlt className="text-primary" />
                    <span>Android 5.0+</span>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-dark-lighten rounded-xl p-6 border border-gray-800 hover:border-primary transition">
                  <FaFilm className="text-4xl text-primary mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Movies & TV Shows</h3>
                  <p className="text-gray-400 text-sm">
                    Access thousands of movies and TV shows from around the world
                  </p>
                </div>

                <div className="bg-dark-lighten rounded-xl p-6 border border-gray-800 hover:border-primary transition">
                  <FaFutbol className="text-4xl text-primary mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Live Sports</h3>
                  <p className="text-gray-400 text-sm">
                    Watch live sports matches and get real-time scores
                  </p>
                </div>

                <div className="bg-dark-lighten rounded-xl p-6 border border-gray-800 hover:border-primary transition">
                  <MdCloudDownload className="text-4xl text-primary mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Download Content</h3>
                  <p className="text-gray-400 text-sm">
                    Download movies and TV shows for offline viewing
                  </p>
                </div>

                <div className="bg-dark-lighten rounded-xl p-6 border border-gray-800 hover:border-primary transition">
                  <FaSearch className="text-4xl text-primary mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
                  <p className="text-gray-400 text-sm">
                    Find your favorite content quickly with intelligent search
                  </p>
                </div>

                <div className="bg-dark-lighten rounded-xl p-6 border border-gray-800 hover:border-primary transition">
                  <FaBookmark className="text-4xl text-primary mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Bookmarks</h3>
                  <p className="text-gray-400 text-sm">
                    Save your favorite movies and TV shows for later
                  </p>
                </div>

                <div className="bg-dark-lighten rounded-xl p-6 border border-gray-800 hover:border-primary transition">
                  <MdHighQuality className="text-4xl text-primary mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">HD Quality</h3>
                  <p className="text-gray-400 text-sm">
                    Multiple streaming sources for the best quality experience
                  </p>
                </div>
              </div>

              {/* Installation Instructions */}
              <div className="bg-dark-lighten rounded-2xl p-8 border border-gray-800 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <FaMobileAlt className="text-primary" />
                  Installation Instructions
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Enable Unknown Sources
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Go to <strong className="text-white">Settings</strong> → <strong className="text-white">Security</strong> (or <strong className="text-white">Apps</strong> → <strong className="text-white">Special Access</strong> on newer Android)
                        <br />
                        Enable <strong className="text-white">"Install unknown apps"</strong> or <strong className="text-white">"Unknown sources"</strong>
                        <br />
                        Select your browser (Chrome, Firefox, etc.)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Download APK
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Click the <strong className="text-white">"Download APK"</strong> button above
                        <br />
                        Wait for the download to complete
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Install & Launch
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Open the downloaded APK from your notifications or Downloads folder
                        <br />
                        Tap <strong className="text-white">"Install"</strong> and wait for installation
                        <br />
                        Tap <strong className="text-white">"Open"</strong> to launch StreamLux
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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

