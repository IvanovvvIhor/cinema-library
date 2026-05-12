import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/User';

const loadSession = (): User | null => {
  const session = localStorage.getItem('cinema_session');
  try {
    return session ? JSON.parse(session) : null;
  } catch {
    return null;
  }
};

const loadGuestStatus = (): boolean => {
  return localStorage.getItem('cinema_guest') === 'true';
};

interface AuthState {
  user: User | null;
  isGuest: boolean;
  token: string | null; 
}

const initialState: AuthState = {
  user: loadSession(),
  isGuest: loadGuestStatus(),
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Головний метод для синхронізації даних з сервером (XP, Level, Rank)
    setCredentials: (state, action: PayloadAction<{ user: User; token?: string | null }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.isGuest = false;
      if (token) state.token = token;
      
      localStorage.setItem('cinema_session', JSON.stringify(user));
      localStorage.removeItem('cinema_guest');
    },

    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isGuest = false;
      localStorage.setItem('cinema_session', JSON.stringify(action.payload));
      localStorage.removeItem('cinema_guest');
    },

    logout: (state) => {
      state.user = null;
      state.isGuest = false;
      state.token = null;
      localStorage.removeItem('cinema_session');
      localStorage.removeItem('cinema_guest');
    },

    setGuestMode: (state) => {
      state.user = null;
      state.isGuest = true;
      localStorage.setItem('cinema_guest', 'true');
      localStorage.removeItem('cinema_session');
    },

    // Спрощений метод для миттєвих оновлень інтерфейсу
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('cinema_session', JSON.stringify(state.user));
      }
    },
  },
});

// Експортуємо setCredentials, щоб ProfilePage міг його бачити
export const { 
  setCredentials, 
  login, 
  logout, 
  setGuestMode, 
  updateUserProfile 
} = authSlice.actions;

export default authSlice.reducer;