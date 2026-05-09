import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addMovieToList, selectUserLists } from '../../store/watchlistSlice';
import { fetchMovieDetails } from '../../services/api';
import type { Movie } from '../../types/Movie';
import type { WatchlistMovie } from '../../types/Watchlist';

interface AddToListPopoverProps {
  movie: Movie;
  onClose: () => void;
}

export const AddToListPopover: React.FC<AddToListPopoverProps> = ({ movie, onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const userLists = useAppSelector((state) => selectUserLists(state, user?.id));
  
  const [loadingListId, setLoadingListId] = useState<string | null>(null);

  const handleAdd = async (listId: string) => {
    setLoadingListId(listId);

    try {
      const details = await fetchMovieDetails(movie.id.toString());

      const movieForList: WatchlistMovie = {
        id: movie.id,
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        posterUrl: movie.posterUrl || null,
        runtime: details?.runtime || 0, 
        genres: details?.genres ? details.genres.map((g: { name: string }) => g.name) : [movie.genre],
        addedAt: Date.now(),
      };

      dispatch(addMovieToList({ listId, movie: movieForList }));
    } catch (error) {
      console.error("Failed to add movie", error);
    } finally {
      setLoadingListId(null);
      onClose();
    }
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 py-2 overflow-hidden animate-in fade-in origin-top-left transition-colors duration-300">
      <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-gray-500 dark:text-[#666] font-bold transition-colors duration-300">Add to list</p>
      
      <div className="flex flex-col max-h-48 overflow-y-auto custom-scrollbar">
        {userLists.map((list) => {
          const isMovieInList = list.movies.some(m => m.id === movie.id);
          
          return (
            <button
              key={list.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isMovieInList) handleAdd(list.id);
              }}
              disabled={isMovieInList || loadingListId === list.id}
              className={`flex items-center justify-between px-4 py-2 text-left text-sm transition-colors duration-200 ${
                isMovieInList 
                  ? 'text-gray-400 dark:text-[#666] cursor-not-allowed' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-[#e50914] dark:hover:text-white'
              }`}
            >
              <span className="truncate pr-2">{list.title}</span>
              
              {loadingListId === list.id && (
                <div className="w-3 h-3 border-2 border-red-600 dark:border-white border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              {isMovieInList && loadingListId !== list.id && (
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-100 dark:border-[#222] mt-1 pt-1 transition-colors duration-300">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose(); 
          }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-[#e50914] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors font-medium"
        >
          + New List
        </button>
      </div>
    </div>
  );
};