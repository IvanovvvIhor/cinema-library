import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addMoviesToList, selectUserLists } from '../../store/watchlistSlice';
import type { Movie } from '../../types/Movie';

// #region Інтерфейси
interface BulkAddProps {
  movies: Movie[]; // Масив фільмів, вибраних у каталозі
  onClose: () => void;
}
// #endregion

export const BulkAddToListPopover: React.FC<BulkAddProps> = ({ movies, onClose }) => {
  // #region Хуки та Redux Селектори
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const userLists = useAppSelector((state) => selectUserLists(state, user?.id));
  // #endregion

  // #region Обробники подій (Handlers)
  const handleAdd = (listId: string) => {
    // Мапінг даних: перетворюємо об'єкти типу Movie в WatchlistMovie
    const moviesToAdd = movies.map(m => ({
      id: m.id,
      title: m.title,
      year: m.year,
      genres: [m.genre], 
      rating: m.rating,
      posterUrl: m.posterUrl || "", 
      addedAt: Date.now(),
      runtime: 0 // Заглушка, оскільки загальне API каталогу не повертає тривалість
    }));

    // Масове додавання в вибраний список через Redux
    dispatch(addMoviesToList({ listId, movies: moviesToAdd }));
    onClose();
  };
  // #endregion

  return (
    <div className="absolute bottom-full mb-4 right-0 w-64 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden z-[70] animate-in fade-in zoom-in-95 duration-200">
      
      {/* Заголовок поповера */}
      <div className="p-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#1c1c1c]">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#666]">
          Add {movies.length} titles to:
        </h4>
      </div>

      {/* Список доступних колекцій користувача */}
      <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
        {userLists.map(list => (
          <button
            key={list.id}
            onClick={() => handleAdd(list.id)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors group text-left"
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#e50914]">
              {list.title}
            </span>
            <span className="text-[10px] text-gray-400">
              {list.movies.length}
            </span>
          </button>
        ))}
      </div>

    </div>
  );
};