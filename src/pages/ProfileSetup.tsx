import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MdCameraAlt, MdArrowForward } from "react-icons/md";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../shared/firebase";
import { useAppDispatch } from "../store/hooks";
import { setCurrentUser } from "../store/slice/authSlice";

const ProfileSetup: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [dob, setDob] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If not logged in at all, kick to auth
        if (!auth.currentUser) {
            navigate("/auth");
        } else {
            // Pre-fill if we have something
            setDisplayName(auth.currentUser.displayName || "");
            setAvatarUrl(auth.currentUser.photoURL || "");
        }
    }, [navigate]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // For now, create an object URL to preview.
            // A real app would upload this to Firebase Storage here and get the download URL.
            // Note: Firebase Storage is currently disabled/uninitialized according to project constraints.
            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
        }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        setIsLoading(true);
        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                firstName: displayName.split(" ")[0] || "",
                lastName: displayName.split(" ").slice(1).join(" ") || "",
                photoUrl: avatarUrl,
                bio,
                dateOfBirth: dob,
                isPremium: false,
                bookmarks: [],
                recentlyWatch: [],
                createdAt: new Date().toISOString()
            }, { merge: true });

            dispatch(setCurrentUser({
                uid: user.uid,
                email: user.email || "",
                displayName: displayName,
                photoURL: avatarUrl,
                emailVerified: user.emailVerified
            }));

            navigate("/");
        } catch (error) {
            console.error("Error setting up profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-dark to-dark -z-10" />
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

            <div className="w-full max-w-md bg-dark-lighten/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                        Customize <span className="text-primary">Profile</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Make it yours before you start watching.</p>
                </div>

                <form onSubmit={handleComplete} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 bg-dark-lighten flex items-center justify-center">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <MdCameraAlt className="size-10 text-gray-500 group-hover:text-primary transition-colors" />
                                )}
                            </div>
                            <label className="absolute inset-0 rounded-full cursor-pointer bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <MdCameraAlt className="size-8 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        </div>
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">Display Name</label>
                        <input
                            type="text"
                            required
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">Bio / About (Optional)</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="A little bit about yourself"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600 resize-none h-24"
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">Date of Birth (GDPR)</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all color-scheme-dark"
                            style={{ colorScheme: "dark" }}
                        />
                        <p className="text-[10px] text-gray-500 mt-2 ml-2 font-medium">Used for age-appropriate content verification.</p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading || !displayName}
                        className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-4 shadow-[0_0_20px_rgba(255,107,53,0.3)]"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>Complete Setup <MdArrowForward size={20} /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
