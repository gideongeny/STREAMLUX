import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MovieState {
    currentSource: string | null;
}

const initialState: MovieState = {
    currentSource: null,
};

const movieSlice = createSlice({
    name: "movie",
    initialState,
    reducers: {
        setSource: (state, action: PayloadAction<string | null>) => {
            state.currentSource = action.payload;
        },
    },
});

export const { setSource } = movieSlice.actions;
export default movieSlice.reducer;
