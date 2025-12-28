import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { UserProfile } from "../../shared/types";
import { User } from "../../shared/types";

interface AuthState {
  user: User | null;
  currentProfile: UserProfile | null;
}

const initialState = {
  user: null,
  currentProfile: null,
} as AuthState;

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setCurrentProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.currentProfile = action.payload;
    },
  },
});

export const { setCurrentUser, setCurrentProfile } = authSlice.actions;

export default authSlice.reducer;
