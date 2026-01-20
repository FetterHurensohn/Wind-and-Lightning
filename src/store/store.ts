import { configureStore } from '@reduxjs/toolkit';
import projectReducer from './projectSlice';
import mediaReducer from './mediaSlice';
import timelineReducer from './timelineSlice';
import effectsReducer from './effectsSlice';
import exportReducer from './exportSlice';

export const store = configureStore({
  reducer: {
    project: projectReducer,
    media: mediaReducer,
    timeline: timelineReducer,
    effects: effectsReducer,
    export: exportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for file objects
    }),
});

// Make store accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).store = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
