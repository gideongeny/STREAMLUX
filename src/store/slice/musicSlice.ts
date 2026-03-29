import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface MusicState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
}

const initialState: MusicState = {
  currentTrack: null,
  isPlaying: false,
  queue: [],
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<Track>) => {
      state.currentTrack = action.payload;
      state.isPlaying = true;
    },
    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    pause: (state) => {
      state.isPlaying = false;
    },
    play: (state) => {
      state.isPlaying = true;
    },
    setQueue: (state, action: PayloadAction<Track[]>) => {
      state.queue = action.payload;
    },
  },
});

export const { setTrack, togglePlay, pause, play, setQueue } = musicSlice.actions;
export default musicSlice.reducer;
