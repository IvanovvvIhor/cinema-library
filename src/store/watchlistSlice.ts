import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Watchlist, WatchlistMovie, ListVisibility } from '../types/Watchlist';
import type { RootState } from './store';

interface WatchlistState {
  lists: Watchlist[];
}

const loadLists = (): Watchlist[] => {
  const data = localStorage.getItem('cinema_watchlists');
  return data ? JSON.parse(data) : [];
};

const saveToStorage = (lists: Watchlist[]) => {
  localStorage.setItem('cinema_watchlists', JSON.stringify(lists));
};

const initialState: WatchlistState = {
  lists: loadLists(),
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    initializeUserLists: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const userLists = state.lists.filter(list => list.ownerId === userId);
      
      const defaultListsConfig = [
        { title: 'Watched', desc: 'Films I have already seen.' },
        { title: 'Plan to Watch', desc: 'Films I want to see.' },
        { title: 'Favorites', desc: 'My all-time favorite films.' }
      ];

      let hasChanges = false;

      defaultListsConfig.forEach((config, index) => {
        const exists = userLists.some(l => l.title === config.title && l.isDefault);
        
        if (!exists) {
          state.lists.push({
            id: crypto.randomUUID(),
            ownerId: userId,
            title: config.title,
            description: config.desc,
            coverUrl: null,
            visibility: 'Private',
            isDefault: true,
            movies: [],
            stats: { views: 0, likes: 0, dislikes: 0 },
            createdAt: Date.now() + index,
          });
          hasChanges = true;
        }
      });

      if (hasChanges) {
        saveToStorage(state.lists);
      }
    },

    createNewList: (state, action: PayloadAction<{ 
      ownerId: string; 
      title: string; 
      description: string; 
      visibility: ListVisibility;
      coverUrl?: string | null;
    }>) => {
      const { coverUrl, ...rest } = action.payload;
      const newList: Watchlist = {
        id: crypto.randomUUID(),
        ...rest,
        coverUrl: coverUrl || null,
        isDefault: false,
        movies: [],
        stats: { views: 0, likes: 0, dislikes: 0 },
        createdAt: Date.now(),
      };
      state.lists.push(newList);
      saveToStorage(state.lists);
    },

    addMovieToList: (state, action: PayloadAction<{ listId: string; movie: WatchlistMovie }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        if (!list.movies.some(m => m.id === action.payload.movie.id)) {
          const movieToAdd = {
            ...action.payload.movie,
            addedAt: action.payload.movie.addedAt || Date.now()
          };
          list.movies.push(movieToAdd);
          saveToStorage(state.lists);
        }
      }
    },

    // Масове додавання
    addMoviesToList: (state, action: PayloadAction<{ listId: string; movies: WatchlistMovie[] }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        action.payload.movies.forEach(newMovie => {
          if (!list.movies.some(m => m.id === newMovie.id)) {
            list.movies.push({
              ...newMovie,
              addedAt: Date.now()
            });
          }
        });
        saveToStorage(state.lists);
      }
    },

    removeMovieFromList: (state, action: PayloadAction<{ listId: string; movieId: number }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        list.movies = list.movies.filter(m => m.id !== action.payload.movieId);
        saveToStorage(state.lists);
      }
    },

    // Масове видалення
    removeMoviesFromList: (state, action: PayloadAction<{ listId: string; movieIds: number[] }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        list.movies = list.movies.filter(m => !action.payload.movieIds.includes(m.id));
        saveToStorage(state.lists);
      }
    },

    updateListCover: (state, action: PayloadAction<{ listId: string; coverUrl: string | null }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        list.coverUrl = action.payload.coverUrl;
        saveToStorage(state.lists);
      }
    },
  },
});

export const { 
  initializeUserLists, 
  createNewList, 
  addMovieToList, 
  addMoviesToList,
  removeMovieFromList,
  removeMoviesFromList,
  updateListCover 
} = watchlistSlice.actions;

export const selectUserLists = (state: RootState, userId: string | undefined) => {
  if (!userId) return [];
  return state.watchlist.lists
    .filter(list => list.ownerId === userId)
    .sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return a.createdAt - b.createdAt;
    });
};

export default watchlistSlice.reducer;
