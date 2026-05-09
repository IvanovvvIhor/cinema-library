import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import watchlistReducer from './watchlistSlice';
import themeReducer from './themeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  watchlist: watchlistReducer,
  theme: themeReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;