import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import downloadReducer from "./slice/downloadSlice";
import uiReducer from "./slice/uiSlice";
import movieReducer from "./slice/movieSlice";
import musicReducer from "./slice/musicSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    download: downloadReducer,
    ui: uiReducer,
    movie: movieReducer,
    music: musicReducer,
  },
});



export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
