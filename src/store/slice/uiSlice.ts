import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    isCinemaMode: boolean;
    isSpotlightOpen: boolean;
    isFullscreen: boolean;
    isSidebarVisible: boolean;
    isGeniusOpen: boolean;
}

const initialState: UIState = {
    isCinemaMode: false,
    isSpotlightOpen: false,
    isFullscreen: false,
    isSidebarVisible: true,
    isGeniusOpen: false,
};

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setCinemaMode: (state, action: PayloadAction<boolean>) => {
            state.isCinemaMode = action.payload;
        },
        toggleCinemaMode: (state) => {
            state.isCinemaMode = !state.isCinemaMode;
        },
        setSpotlightOpen: (state, action: PayloadAction<boolean>) => {
            state.isSpotlightOpen = action.payload;
        },
        toggleSpotlight: (state) => {
            state.isSpotlightOpen = !state.isSpotlightOpen;
        },
        setFullscreen: (state, action: PayloadAction<boolean>) => {
            state.isFullscreen = action.payload;
        },
        toggleFullscreen: (state) => {
            state.isFullscreen = !state.isFullscreen;
        },
        setSidebarVisible: (state, action: PayloadAction<boolean>) => {
            state.isSidebarVisible = action.payload;
        },
        toggleSidebar: (state) => {
            state.isSidebarVisible = !state.isSidebarVisible;
        },
        setGeniusOpen: (state, action: PayloadAction<boolean>) => {
            state.isGeniusOpen = action.payload;
        },
        toggleGenius: (state) => {
            state.isGeniusOpen = !state.isGeniusOpen;
        },
    },
});

export const { 
    setCinemaMode, 
    toggleCinemaMode, 
    setSpotlightOpen, 
    toggleSpotlight, 
    setFullscreen, 
    toggleFullscreen,
    setSidebarVisible,
    toggleSidebar,
    setGeniusOpen,
    toggleGenius
} = uiSlice.actions;

export default uiSlice.reducer;
