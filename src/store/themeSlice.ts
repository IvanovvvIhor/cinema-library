import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

const getInitialTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem('cinema_theme') as ThemeMode;
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  
  return 'light'; 
};

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      localStorage.setItem('cinema_theme', state.mode);
    }
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;