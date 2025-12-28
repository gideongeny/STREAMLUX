import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Item } from "../../shared/types";

export interface DownloadItem extends Item {
    downloadDate: number; // Timestamp
    progress: number; // 0-100
    status: "pending" | "downloading" | "completed" | "failed";
    size?: string;
    sourceUrl?: string; // For "playing" offline (simulated)
}

interface DownloadState {
    downloads: DownloadItem[];
}

// Load initial state from localStorage
const loadState = (): DownloadItem[] => {
    try {
        const serializedState = localStorage.getItem("downloads");
        if (serializedState === null) {
            return [];
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return [];
    }
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
            action: PayloadAction<{ id: number; progress: number }>
        ) => {
            const item = state.downloads.find((d) => d.id === action.payload.id);
            if (item) {
                item.progress = action.payload.progress;
                if (action.payload.progress >= 100) {
                    item.status = "completed";
                    item.progress = 100;
                } else {
                    item.status = "downloading";
                }
            }
        },
        removeDownload: (state, action: PayloadAction<number>) => {
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
