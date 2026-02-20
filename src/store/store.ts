import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import downloadReducer from "./slice/downloadSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    download: downloadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
