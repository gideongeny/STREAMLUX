import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  album?: string;
  streamUrl?: string; // Direct audio stream from Saavn
  source?: 'saavn' | 'youtube';
}

interface MusicState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  isExpanded: boolean;
}

const initialState: MusicState = {
  currentTrack: null,
  isPlaying: false,
  queue: [],
  isExpanded: false,
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
    playNext: (state) => {
      if (state.queue.length > 0 && state.currentTrack) {
        const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
        if (currentIndex !== -1 && currentIndex < state.queue.length - 1) {
          state.currentTrack = state.queue[currentIndex + 1];
          state.isPlaying = true;
        }
      }
    },
    playPrevious: (state) => {
      if (state.queue.length > 0 && state.currentTrack) {
        const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
        if (currentIndex > 0) {
          state.currentTrack = state.queue[currentIndex - 1];
          state.isPlaying = true;
        }
      }
    },
    toggleExpanded: (state) => {
      state.isExpanded = !state.isExpanded;
    },
    setExpanded: (state, action: PayloadAction<boolean>) => {
      state.isExpanded = action.payload;
    },
    clearTrack: (state) => {
      state.currentTrack = null;
      state.isPlaying = false;
      state.isExpanded = false;
      state.queue = [];
    },
  },
});

export const { setTrack, togglePlay, pause, play, setQueue, playNext, playPrevious, toggleExpanded, setExpanded, clearTrack } = musicSlice.actions;
export default musicSlice.reducer;
