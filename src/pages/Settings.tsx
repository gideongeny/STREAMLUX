import { FunctionComponent, useEffect, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../components/Common/Sidebar";
import Title from "../components/Common/Title";
import Footer from "../components/Footer/Footer";

interface SettingsProps { }

const Settings: FunctionComponent<SettingsProps> = () => {
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const keyInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load saved key on mount
        const savedKey = localStorage.getItem("user_youtube_api_key");
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleSaveKey = () => {
        const newKey = keyInputRef.current?.value.trim();
        if (!newKey) {
            localStorage.removeItem("user_youtube_api_key");
            setApiKey("");
            toast.info("API Key removed. Reverting to default quota.", { position: "top-right" });
            return;
        }

        localStorage.setItem("user_youtube_api_key", newKey);
        setApiKey(newKey);
        toast.success("API Key saved! You now have custom quota.", { position: "top-right" });
    };

    return (
        <>
            <Title value="Settings | StreamLux" />
            <ToastContainer />

            {/* Mobile Header */}
            <div className="flex md:hidden justify-between items-center px-5 my-5">
                <Link to="/" className="flex gap-2 items-center">
                    <img src="/logo.svg" alt="StreamLux Logo" className="h-10 w-10" />
                    <p className="text-xl text-white font-medium tracking-wider uppercase">
                        Stream<span className="text-primary">Lux</span>
                    </p>
                </Link>
                <button onClick={() => setIsSidebarActive((prev) => !prev)}>
                    <GiHamburgerMenu size={25} className="text-white" />
                </button>
            </div>

            <div className="flex min-h-screen">
                <Sidebar
                    onCloseSidebar={() => setIsSidebarActive(false)}
                    isSidebarActive={isSidebarActive}
                />

                <div className="flex-grow pt-10 md:pl-10 px-6 bg-dark-lighten min-h-screen">
                    <div className="pb-4 border-b border-white/10 mb-8">
                        <h1 className="text-[35px] text-white font-semibold uppercase">
                            App Settings
                        </h1>
                        <p className="text-gray-400 mt-2">Configuration and Preferences</p>
                    </div>

                    <div className="max-w-2xl">
                        {/* API Key Section */}
                        <div className="bg-dark p-6 rounded-xl border border-white/5 shadow-lg mb-8">
                            <h2 className="text-xl text-white font-bold mb-4 flex items-center gap-2">
                                <span className="text-primary">⚡</span> Bring Your Own Key (BYOK)
                            </h2>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Experience unlimited searching and streaming by using your own free YouTube API Key.
                                This provides you with 10,000 requests per day (vs shared quota).
                                <a
                                    href="https://developers.google.com/youtube/v3/getting-started"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-primary hover:underline ml-1"
                                >
                                    Get a key here
                                </a>.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        YouTube Data API Key
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            ref={keyInputRef}
                                            type="text"
                                            defaultValue={apiKey}
                                            placeholder="Leave empty to use shared system quota (AIzaSy...)"
                                            className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors font-mono text-sm"
                                        />
                                        <button
                                            onClick={handleSaveKey}
                                            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors shadow-lg shadow-primary/20"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>

                                {apiKey && (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-3">
                                        <div className="text-green-500 mt-0.5">✓</div>
                                        <div>
                                            <p className="text-green-400 text-sm font-bold">Custom Key Active</p>
                                            <p className="text-green-400/70 text-xs">StreamLux is using your personal quota.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Other Settings Placeholders - Scalability for more settings */}
                        <div className="bg-dark p-6 rounded-xl border border-white/5 opacity-50 select-none cursor-not-allowed">
                            <h2 className="text-xl text-white font-bold mb-4">Playback Preferences</h2>
                            <p className="text-gray-400 text-sm">Coming soon...</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;
