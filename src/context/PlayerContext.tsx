import { createContext, useContext, useState, ReactNode } from "react";

interface MiniPlayerData {
    mediaId: number;
    mediaType: "movie" | "tv";
    seasonId?: number;
    episodeId?: number;
    sourceUrl: string;
    currentTime: number; // For resuming
    title: string;
    posterPath: string;
}

interface PlayerContextType {
    miniPlayerData: MiniPlayerData | null;
    setMiniPlayerData: (data: MiniPlayerData | null) => void;
    isPlayerOpen: boolean;
    setIsPlayerOpen: (isOpen: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    const [miniPlayerData, setMiniPlayerData] = useState<MiniPlayerData | null>(null);
    const [isPlayerOpen, setIsPlayerOpen] = useState(false);

    return (
        <PlayerContext.Provider
            value={{
                miniPlayerData,
                setMiniPlayerData,
                isPlayerOpen,
                setIsPlayerOpen,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error("usePlayer must be used within a PlayerProvider");
    }
    return context;
};
