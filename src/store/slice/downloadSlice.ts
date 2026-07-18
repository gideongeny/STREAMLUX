import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Item } from "../../shared/types";
import { safeStorage } from "../../utils/safeStorage";

export interface DownloadItem extends Omit<Item, 'id'> {
    id: number | string;
    downloadDate: number; // Timestamp
    progress: number; // 0-100
    status: "pending" | "downloading" | "completed" | "failed";
    size?: string;
    sourceUrl?: string; // For "playing" offline (simulated)
    speed?: string;
    eta?: string;
}

interface DownloadState {
    downloads: DownloadItem[];
}

// Load initial state from localStorage
const loadState = (): DownloadItem[] => {
    return safeStorage.getParsed<DownloadItem[]>("downloads", []);
};

const initialState: DownloadState = {
    downloads: loadState(),
};

const downloadSlice = createSlice({
    name: "download",
    initialState,
    reducers: {
        addDownload: (state, action: PayloadAction<DownloadItem>) => {
            // Check if already exists
            const exists = state.downloads.find((d) => d.id === action.payload.id);
            if (!exists) {
                state.downloads.unshift(action.payload);
            }
        },
        updateDownloadProgress: (
            state,
            action: PayloadAction<{ id: number | string; progress: number; speed?: string; eta?: string }>
        ) => {
            const item = state.downloads.find((d) => d.id === action.payload.id);
            if (item) {
                item.progress = action.payload.progress;
                item.speed = action.payload.speed;
                item.eta = action.payload.eta;
                if (action.payload.progress >= 100) {
                    item.status = "completed";
                    item.progress = 100;
                    item.speed = undefined;
                    item.eta = undefined;
                } else {
                    item.status = "downloading";
                }
            }
        },
        removeDownload: (state, action: PayloadAction<number | string>) => {
            state.downloads = state.downloads.filter((d) => d.id !== action.payload);
        },
        clearDownloads: (state) => {
            state.downloads = [];
        },
    },
});

export const {
    addDownload,
    updateDownloadProgress,
    removeDownload,
    clearDownloads,
} = downloadSlice.actions;

export default downloadSlice.reducer;
