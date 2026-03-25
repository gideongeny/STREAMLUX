import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    isCinemaMode: boolean;
    isSpotlightOpen: boolean;
    isFullscreen: boolean;
}

const initialState: UIState = {
    isCinemaMode: false,
    isSpotlightOpen: false,
    isFullscreen: false,
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
    },
});

export const { setCinemaMode, toggleCinemaMode, setSpotlightOpen, toggleSpotlight, setFullscreen, toggleFullscreen } = uiSlice.actions;

export default uiSlice.reducer;
