import { FC, useEffect, useState } from "react";
import { UserProfile } from "../../shared/types";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setCurrentProfile } from "../../store/slice/authSlice";
import { createProfile, getProfiles, PROFILE_AVATARS } from "../../services/user";
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


    useEffect(() => {
        if (!currentUser) return;

        const loadProfiles = async () => {
            const data = await getProfiles(currentUser.uid);
            if (data.length === 0) {
                // Auto create Main profile if none exist (First time migration)
                const mainProfile = await createProfile(currentUser.uid, {
                    name: currentUser.displayName || "User",
                    avatar: PROFILE_AVATARS[0],
                    isKid: false,
                    language: "en"
                });
                if (mainProfile) setProfiles([mainProfile]);
            } else {
                setProfiles(data);
            }
            setLoading(false);
        };
        loadProfiles();
    }, [currentUser]);

    const handleSelectProfile = (profile: UserProfile) => {
        dispatch(setCurrentProfile(profile));
        // Persist choice (optional)
        localStorage.setItem("current_profile_id", profile.id);
        navigate("/");
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
            setProfiles([...profiles, newProfile]);
            setIsCreating(false);
            setNewProfileName("");
            setIsKid(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#141414]">
                <div className="flex gap-4">
                    <Skeleton className="w-[150px] h-[150px] rounded-md" />
                    <Skeleton className="w-[150px] h-[150px] rounded-md" />
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
                        className="group flex flex-col items-center gap-3 cursor-pointer w-[100px] md:w-[150px]"
                        onClick={() => handleSelectProfile(profile)}
                    >
                        <div className="w-full aspect-square rounded-md overflow-hidden border-2 border-transparent group-hover:border-white transition relative">
                            <img src={profile.avatar || PROFILE_AVATARS[0]} alt={profile.name} className="w-full h-full object-cover" />
                            {/* Kid Badge */}
                            {profile.isKid && (
                                <div className="absolute top-1 right-1 bg-primary text-white text-[9px] px-1 rounded font-bold">KIDS</div>
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

            <button className="mt-20 border border-gray-500 text-gray-500 px-8 py-2 uppercase tracking-widest text-lg hover:border-white hover:text-white transition">
                Manage Profiles
            </button>
        </div>
    );
};

export default ProfileGate;
