import { FunctionComponent, useEffect, useRef, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../components/Common/Sidebar";
import Title from "../components/Common/Title";
import NotificationRequest from "../components/Common/NotificationRequest";
import NotificationSettings from "../components/Settings/NotificationSettings";
import LanguageSelector from "../components/Common/LanguageSelector";
import { validateYouTubeKey } from "../services/youtube";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCurrentProfile } from "../store/slice/authSlice";
import { updateProfile } from "../services/user";
import { UserProfile } from "../shared/types";
import { safeStorage } from "../utils/safeStorage";
import { biometricAuthService } from "../services/biometricAuth";
import { backgroundAudioService } from "../services/backgroundAudio";

interface SettingsProps { }

const THEME_COLORS = [
    { name: "Orange", value: "#ff6b35" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#ef4444" },
    { name: "Green", value: "#10b981" },
    { name: "Cyan", value: "#06b6d4" },
];

const Settings: FunctionComponent<SettingsProps> = () => {
    const [isSidebarActive, setIsSidebarActive] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const keyInputRef = useRef<HTMLInputElement>(null);

    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);
    const currentProfile = useAppSelector((state) => state.auth.currentProfile);

    // Initial load from safeStorage
    const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(() =>
        safeStorage.get("autoplay_enabled") === "true"
    );

    const [isBiometricEnabled, setIsBiometricEnabled] = useState(() =>
        biometricAuthService.isBiometricEnabled()
    );

    const [isBackgroundAudioEnabled, setIsBackgroundAudioEnabled] = useState(() =>
        safeStorage.get("background_audio_enabled") === "true"
    );

    useEffect(() => {
        // Load saved key on mount
        const savedKey = safeStorage.get("user_youtube_api_key");
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleSaveKey = async () => {
        const newKey = keyInputRef.current?.value.trim();

        if (!newKey) {
            safeStorage.remove("user_youtube_api_key");
            setApiKey("");
            toast.info("API Key removed. Reverting to default quota.", { position: "top-right" });
            return;
        }

        setIsValidating(true);
        const isValid = await validateYouTubeKey(newKey);
        setIsValidating(false);

        if (isValid) {
            safeStorage.set("user_youtube_api_key", newKey);
            setApiKey(newKey);
            toast.success("API Key verified and saved! Custom quota active.", { position: "top-right" });
        } else {
            toast.error("Invalid API Key. Please check and try again.", { position: "top-right" });
        }
    };

    const handleThemeChange = (color: string) => {
        // Update CSS variable
        document.documentElement.style.setProperty("--color-primary", color);
        safeStorage.set("theme_primary_color", color);
        
        // Also update Tailwind's primary color by injecting a style tag
        let styleTag = document.getElementById("dynamic-primary-color");
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = "dynamic-primary-color";
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = `
            :root {
                --color-primary: ${color};
            }
            .text-primary { color: ${color} !important; }
            .bg-primary { background-color: ${color} !important; }
            .border-primary { border-color: ${color} !important; }
            .hover\\:bg-primary:hover { background-color: ${color} !important; }
            .hover\\:text-primary:hover { color: ${color} !important; }
            .hover\\:border-primary:hover { border-color: ${color} !important; }
        `;
        
        toast.success("Theme updated! Refresh to see all changes.", { position: "top-right", autoClose: 2000 });
    };

    const handleKidModeToggle = async () => {
        if (!currentUser || !currentProfile) {
            toast.error("Please log in to change profile settings.");
            return;
        }

        const newIsKid = !currentProfile.isKid;
        const updatedProfile: UserProfile = { ...currentProfile, isKid: newIsKid };

        // 1. Update Redux
        dispatch(setCurrentProfile(updatedProfile));

        // 2. Update Firestore for persistence
        const success = await updateProfile(currentUser.uid, currentProfile.id, { isKid: newIsKid });

        if (success) {
            toast.success(`Kid Mode ${newIsKid ? "Enabled" : "Disabled"}`, { position: "top-right", autoClose: 1000 });
        } else {
            toast.warn("Settings updated locally, but failed to save to cloud.", { position: "top-right" });
        }
    };

    const handleAutoplayToggle = () => {
        const newState = !isAutoplayEnabled;
        setIsAutoplayEnabled(newState);
        safeStorage.set("autoplay_enabled", String(newState));
        toast.info(`Auto-Play ${newState ? "Enabled" : "Disabled"}`, { position: "bottom-right", autoClose: 1000 });
    };

    const handleClearCache = () => {
        const keysToRemove = safeStorage.keys().filter(key =>
            key.startsWith("search_") ||
            key.startsWith("video_detail_") ||
            key.startsWith("tmdb_cache_") ||
            key.startsWith("yt_cache_")
        );
        keysToRemove.forEach(key => safeStorage.remove(key));
        toast.success(`Cleared ${keysToRemove.length} cached items!`, { position: "top-right" });
    };

    const handleBiometricToggle = async () => {
        if (!isBiometricEnabled) {
            const success = await biometricAuthService.enableBiometric();
            if (success) {
                setIsBiometricEnabled(true);
                toast.success("Biometric Authentication Enabled", { position: "top-right", autoClose: 1000 });
            } else {
                toast.error("Biometric not supported or permission denied", { position: "top-right" });
            }
        } else {
            biometricAuthService.disableBiometric();
            setIsBiometricEnabled(false);
            toast.info("Biometric Authentication Disabled", { position: "top-right", autoClose: 1000 });
        }
    };

    const handleBackgroundAudioToggle = () => {
        const newState = !isBackgroundAudioEnabled;
        setIsBackgroundAudioEnabled(newState);
        safeStorage.set("background_audio_enabled", String(newState));
        toast.info(`Background Audio ${newState ? "Enabled" : "Disabled"}`, { position: "top-right", autoClose: 1000 });
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

                <div className="flex-grow pt-10 md:pl-10 px-6 bg-dark-lighten min-h-screen min-w-0">
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
                            </p>

                            {/* Help Section */}
                            <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/5">
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                    <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">?</span>
                                    How to get a key (Free)
                                </h3>
                                <div className="text-gray-400 text-sm space-y-2 pl-8">
                                    <p>1. Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Cloud Console</a>.</p>
                                    <p>2. Create a new project (name it "StreamLux").</p>
                                    <p>3. Search for <strong>"YouTube Data API v3"</strong> and click Enable.</p>
                                    <p>4. Go to <strong>Credentials</strong> → <strong>Create Credentials</strong> → <strong>API Key</strong>.</p>
                                    <p>5. Copy the key (starts with 'AIza...') and paste it below.</p>
                                </div>
                            </div>

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
                                            disabled={isValidating}
                                            className={`px-6 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors shadow-lg shadow-primary/20 ${isValidating ? 'opacity-70 cursor-wait' : ''}`}
                                        >
                                            {isValidating ? 'Checking...' : 'Save'}
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

                        {/* Theme Section */}
                        <div className="bg-dark p-6 rounded-xl border border-white/5 shadow-lg mb-8">
                            <h2 className="text-xl text-white font-bold mb-4">Appearance</h2>
                            <p className="text-gray-400 text-sm mb-4">Customize the accent color of the application.</p>

                            <div className="flex flex-wrap gap-4">
                                {THEME_COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => handleThemeChange(color.value)}
                                        className="w-10 h-10 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 border-transparent hover:border-white focus:outline-none focus:border-white"
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Playback Preferences */}
                        <div className="bg-dark p-6 rounded-xl border border-white/5 shadow-lg mb-8">
                            <h2 className="text-xl text-white font-bold mb-4">Playback & Experience</h2>
                            <p className="text-gray-400 text-sm mb-4">Manage your viewing experience and data.</p>

                            <div className="space-y-6">
                                {/* Kid Mode Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">Kid Mode</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Filters content to be family-friendly (Animation, Family genres).
                                            <br />
                                            Active for the current profile: <span className="text-primary font-bold">{currentProfile?.name || "Guest"}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleKidModeToggle}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${currentProfile?.isKid ? "bg-primary" : "bg-gray-700"}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${currentProfile?.isKid ? "translate-x-6" : ""}`} />
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/5" />

                                {/* Auto-Play Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">Auto-Play Selected Source</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Automatically try to play the first available server.
                                            <br />
                                            <span className="text-orange-500/80">Experimental feature.</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAutoplayToggle}
                                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isAutoplayEnabled ? "bg-primary" : "bg-gray-700"}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isAutoplayEnabled ? "translate-x-6" : ""}`} />
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/5" />

                                {/* Clear Cache */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">Clear App Cache</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Fixes loading issues by clearing locally stored data (searches, history).
                                            <br />
                                            Safe to use; does not delete your account.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClearCache}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg transition-colors border border-white/10"
                                    >
                                        Clear Cache
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/5" />

                                {/* Language Selection */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-medium">App Language</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Change the application interface language.
                                        </p>
                                    </div>
                                    <div className="w-48">
                                        <LanguageSelector />
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/5" />

                                {/* Native Features Section */}
                                <div className="pb-2">
                                    <p className="text-primary text-[10px] font-bold uppercase tracking-widest mb-4">Native Experience (App only)</p>

                                    <div className="space-y-6">
                                        {/* Biometric Toggle */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-medium">Biometric Unlock</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    Use Fingerprint or Face ID to quickly unlock your profile.
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleBiometricToggle}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isBiometricEnabled ? "bg-primary" : "bg-gray-700"}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isBiometricEnabled ? "translate-x-6" : ""}`} />
                                            </button>
                                        </div>

                                        {/* Background Audio Toggle */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-medium">Background Playback</p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    Keep audio playing when the app is minimized or the screen is off.
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleBackgroundAudioToggle}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isBackgroundAudioEnabled ? "bg-primary" : "bg-gray-700"}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isBackgroundAudioEnabled ? "translate-x-6" : ""}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Section - Enhanced for Android */}
                    <NotificationSettings />
                </div>
            </div>
        </>
    );
};

export default Settings;
