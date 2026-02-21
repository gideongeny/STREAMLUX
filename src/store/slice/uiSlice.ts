import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    isCinemaMode: boolean;
    isSpotlightOpen: boolean;
}

const initialState: UIState = {
    isCinemaMode: false,
    isSpotlightOpen: false,
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
    },
});

export const { setCinemaMode, toggleCinemaMode, setSpotlightOpen, toggleSpotlight } = uiSlice.actions;

export default uiSlice.reducer;
