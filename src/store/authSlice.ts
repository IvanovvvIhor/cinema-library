import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/User';

const loadSession = (): User | null => {
  const session = localStorage.getItem('cinema_session');
  return session ? JSON.parse(session) : null;
};

const loadGuestStatus = (): boolean => {
  return localStorage.getItem('cinema_guest') === 'true';
};

interface AuthState {
  user: User | null;
  isGuest: boolean;
}

const initialState: AuthState = {
  user: loadSession(),
  isGuest: loadGuestStatus(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isGuest = false;
      localStorage.setItem('cinema_session', JSON.stringify(action.payload));
      localStorage.removeItem('cinema_guest');
    },
    logout: (state) => {
      state.user = null;
      state.isGuest = false;
      localStorage.removeItem('cinema_session');
      localStorage.removeItem('cinema_guest');
    },
    setGuestMode: (state) => {
      state.user = null;
      state.isGuest = true;
      localStorage.setItem('cinema_guest', 'true');
      localStorage.removeItem('cinema_session');
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        localStorage.setItem('cinema_session', JSON.stringify(state.user));
        
        const usersDB: User[] = JSON.parse(localStorage.getItem('cinema_users_db') || '[]');
        const userIndex = usersDB.findIndex(u => u.id === state.user!.id);
        
        if (userIndex !== -1) {
          usersDB[userIndex] = state.user;
          localStorage.setItem('cinema_users_db', JSON.stringify(usersDB));
        }
      }
    },
  },
});

export const { login, logout, setGuestMode, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;