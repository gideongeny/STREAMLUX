import { FC, useEffect, useState } from "react";
import { UserProfile } from "../../shared/types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setCurrentProfile } from "../../store/slice/authSlice";
import { createProfile, getProfiles, deleteProfile, PROFILE_AVATARS } from "../../services/user";
import { useNavigate } from "react-router-dom";
import { AiOutlinePlus } from "react-icons/ai";
import Skeleton from "../Common/Skeleton";

const ProfileGate: FC = () => {
    const currentUser = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newProfileName, setNewProfileName] = useState("");
    const [isKid, setIsKid] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProfiles = async () => {
        if (!currentUser) return;

        // Try to load from cache first for instant UI
        const cached = localStorage.getItem(`profiles_${currentUser.uid}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setProfiles(parsed);
                    setLoading(false);
                }
            } catch (e) { }
        } else {
            setLoading(true);
        }

        setError(null);

        // Add a 7-second safety timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timed out")), 7000)
        );

        try {
            const data = await Promise.race([
                getProfiles(currentUser.uid),
                timeoutPromise
            ]) as UserProfile[];

            if (data.length === 0) {
                const mainProfile = await createProfile(currentUser.uid, {
                    name: (currentUser.displayName && currentUser.displayName !== "undefined undefined")
                        ? currentUser.displayName
                        : "Main User",
                    avatar: PROFILE_AVATARS[0],
                    isKid: false,
                    language: "en"
                });
                if (mainProfile) {
                    const freshProfiles = [mainProfile];
                    setProfiles(freshProfiles);
                    localStorage.setItem(`profiles_${currentUser.uid}`, JSON.stringify(freshProfiles));

                    // Instant auto-select if it's the only one
                    handleSelectProfile(mainProfile);
                }
            } else {
                setProfiles(data);
                localStorage.setItem(`profiles_${currentUser.uid}`, JSON.stringify(data));

                // If only one profile and not editing, auto-select for speed
                if (data.length === 1 && !isEditing) {
                    const lastUsed = localStorage.getItem("current_profile_id");
                    if (!lastUsed || lastUsed === data[0].id) {
                        // Small delay to allow component to mount cleanly
                        setTimeout(() => handleSelectProfile(data[0]), 100);
                    }
                }
            }
        } catch (err: any) {
            console.error("Failed to load profiles:", err);
            // If we have cached profiles, don't show full error screen
            if (profiles.length === 0) {
                setError("Profile loading is slow. Tap below to retry or go back.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelectProfile = (profile: UserProfile) => {
        dispatch(setCurrentProfile(profile));
        localStorage.setItem("current_profile_id", profile.id);
        localStorage.setItem("current_profile", JSON.stringify(profile));
        navigate("/");
    };

    const handleDeleteProfile = async (e: React.MouseEvent, profileId: string) => {
        e.stopPropagation();
        if (!currentUser || profiles.length <= 1) return;

        const success = await deleteProfile(currentUser.uid, profileId);
        if (success) {
            const updated = profiles.filter(p => p.id !== profileId);
            setProfiles(updated);
            localStorage.setItem(`profiles_${currentUser.uid}`, JSON.stringify(updated));
        }
    };

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !newProfileName.trim()) return;

        const newProfile = await createProfile(currentUser.uid, {
            name: newProfileName,
            avatar: isKid ? PROFILE_AVATARS[8] : PROFILE_AVATARS[Math.floor(Math.random() * 8)],
            isKid,
            language: "en"
        });

        if (newProfile) {
            const updated = [...profiles, newProfile];
            setProfiles(updated);
            localStorage.setItem(`profiles_${currentUser.uid}`, JSON.stringify(updated));
            setIsCreating(false);
            setNewProfileName("");
            setIsKid(false);
        }
    };

    useEffect(() => {
        loadProfiles();
    }, [currentUser]);

    if (loading && profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414]">
                <div className="flex flex-col items-center gap-8">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <h1 className="text-2xl text-white font-medium animate-pulse italic">Setting up your StreamLux...</h1>
                </div>
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] animate-fade-in">
                <h1 className="text-4xl text-white mb-2">Add Profile</h1>
                <p className="text-gray-400 mb-8">Add a profile for another person watching StreamLux.</p>

                <form onSubmit={handleCreateProfile} className="flex flex-col gap-6 w-full max-w-md px-4">
                    <div className="flex items-center gap-4 border-b border-gray-600 pb-4">
                        <img src={isKid ? PROFILE_AVATARS[8] : PROFILE_AVATARS[0]} alt="Avatar" className="w-24 h-24 rounded-md" />
                        <input
                            type="text"
                            placeholder="Name"
                            value={newProfileName}
                            onChange={(e) => setNewProfileName(e.target.value)}
                            className="bg-[#333] text-white px-4 py-2 rounded w-full outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="kid-mode"
                            checked={isKid}
                            onChange={(e) => setIsKid(e.target.checked)}
                            className="w-6 h-6 accent-primary"
                        />
                        <label htmlFor="kid-mode" className="text-white cursor-pointer select-none">
                            Kid?
                        </label>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <button
                            type="submit"
                            className="bg-white text-black font-bold px-6 py-2 rounded hover:bg-red-600 hover:text-white transition"
                        >
                            Continue
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsCreating(false)}
                            className="border border-gray-500 text-gray-400 font-bold px-6 py-2 rounded hover:border-white hover:text-white transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#141414] animate-fade-in">
            <h1 className="text-4xl text-white md:text-5xl font-medium mb-12 select-none">Who's watching?</h1>

            <div className="flex flex-wrap justify-center gap-8">
                {profiles.map(profile => (
                    <div
                        key={profile.id}
                        className={`group flex flex-col items-center gap-3 cursor-pointer w-[100px] md:w-[150px] ${isEditing ? 'opacity-80' : ''}`}
                        onClick={() => handleSelectProfile(profile)}
                    >
                        <div className="w-full aspect-square rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition relative">
                            <img src={profile.avatar || PROFILE_AVATARS[0]} alt={profile.name} className="w-full h-full object-cover" />
                            {/* Kid Badge */}
                            {profile.isKid && (
                                <div className="absolute top-1 right-1 bg-primary text-white text-[9px] px-1 rounded font-bold">KIDS</div>
                            )}
                            {/* Delete Button (Visible in Editing mode) */}
                            {isEditing && profiles.length > 1 && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center bg-black/50"
                                    onClick={(e) => handleDeleteProfile(e, profile.id)}
                                >
                                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white text-3xl hover:bg-white hover:text-black transition">
                                        ×
                                    </div>
                                </div>
                            )}
                        </div>
                        <span className="text-gray-400 group-hover:text-white text-lg md:text-xl truncate max-w-full">{profile.name}</span>
                    </div>
                ))}

                {/* Add Profile Button */}
                {profiles.length < 5 && (
                    <div
                        className="group flex flex-col items-center gap-3 cursor-pointer w-[100px] md:w-[150px]"
                        onClick={() => setIsCreating(true)}
                    >
                        <div className="w-full aspect-square rounded-md flex items-center justify-center bg-transparent border-2 border-transparent group-hover:bg-white group-hover:border-white transition">
                            <AiOutlinePlus className="text-gray-400 text-6xl group-hover:text-black transition" />
                        </div>
                        <span className="text-gray-400 group-hover:text-white text-lg md:text-xl">Add Profile</span>
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsEditing(!isEditing)}
                className={`mt-20 border px-8 py-2 uppercase tracking-widest text-lg transition ${isEditing
                    ? "bg-white text-black border-white hover:bg-transparent hover:text-white"
                    : "border-gray-500 text-gray-500 hover:border-white hover:text-white"
                    }`}
            >
                {isEditing ? "Done" : "Manage Profiles"}
            </button>
        </div>
    );
};

export default ProfileGate;
