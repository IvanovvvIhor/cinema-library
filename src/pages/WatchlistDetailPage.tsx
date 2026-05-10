import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { removeMovieFromList, updateListCover } from "../store/watchlistSlice";
import { useTranslation } from "react-i18next";

export const WatchlistDetailPage: React.FC = () => {
  // #region Хуки та Навігація
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  // #endregion

  // #region Селектори Redux (Отримання даних списку)
  const user = useAppSelector((state) => state.auth.user);
  const list = useAppSelector((state) => 
    state.watchlist.lists.find((l) => l.id === id)
  );
  // #endregion

  // #region Перевірка доступу (Access Control)
  if (!list || (list.visibility === 'Private' && list.ownerId !== user?.id)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white transition-colors duration-300">
        <span className="text-4xl mb-4">🚷</span>
        <h2 className="text-xl font-bold mb-2">List not found</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="px-6 py-2 bg-gray-200 dark:bg-[#2a2a2a] text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 transition-colors mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }
  // #endregion

  // #region Допоміжні розрахунки (Обкладинка та Форматування)
  // Пріоритет: кастомна обкладинка -> постер першого фільму -> null
  const coverImage = list.coverUrl || (list.movies.length > 0 ? list.movies[0].posterUrl : null);
  // #endregion

  // #region Обробники подій (Handlers)
  
  // Видалення одного фільму зі списку
  const handleRemoveMovie = (movieId: number) => {
    dispatch(removeMovieFromList({ listId: list.id, movieId }));
  };

  // Зміна обкладинки списку через URL
  const handleChangeCover = () => {
    if (list.ownerId !== user?.id) return;
    
    const newUrl = window.prompt(
      t('settings.enterAvatarUrl') || "Enter cover image URL:", 
      list.coverUrl || ""
    );
    
    if (newUrl !== null) {
      dispatch(updateListCover({ listId: list.id, coverUrl: newUrl.trim() }));
    }
  };
  // #endregion

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111] overflow-y-auto relative transition-colors duration-300">
      
      {/* Імерсивний фоновий градієнт, що підлаштовується під обкладинку */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none overflow-hidden opacity-30">
        {coverImage ? (
          <img src={coverImage} alt="blur" className="w-full h-full object-cover blur-3xl scale-150 transition-opacity duration-300" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#e50914] to-gray-50 dark:to-[#111] blur-3xl transition-colors duration-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 dark:via-[#111]/80 to-gray-50 dark:to-[#111] transition-colors duration-300" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 px-8 py-12 max-w-[1400px] mx-auto w-full">
        
        {/* ЛІВА КОЛОНКА: Інформація про список та Обкладинка */}
        <aside className="w-full md:w-[300px] flex-shrink-0 flex flex-col gap-6">
          <div className="relative group/cover w-full aspect-square bg-gray-200 dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-300 dark:border-[#2a2a2a] transition-all duration-300">
            {coverImage ? (
              <img src={coverImage} alt={list.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 dark:opacity-10">🎬</div>
            )}

            {/* Кнопка зміни обкладинки (тільки для власника) */}
            {list.ownerId === user?.id && (
              <button 
                onClick={handleChangeCover}
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]"
              >
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">Change Cover</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">{list.title}</h1>
            <p className="text-gray-500 dark:text-[#8c8c8c] text-sm leading-relaxed">{list.description}</p>
            
            <div className="flex items-center gap-2 mt-2 text-[13px] font-medium text-gray-600 dark:text-[#666]">
              {list.isDefault ? (
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-white rounded-md text-[11px] uppercase tracking-wider">System List</span>
              ) : (
                <span className="flex items-center gap-1">
                  {list.visibility === 'Public' ? '🌍 Public' : '🔒 Private'}
                </span>
              )}
              <span>•</span>
              <span>{list.movies.length} movies</span>
            </div>
          </div>
        </aside>

        {/* ПРАВА КОЛОНКА: Таблиця фільмів */}
        <main className="flex-1 flex flex-col min-w-0">
          {list.movies.length > 0 && (
            <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-[#222] text-gray-500 dark:text-[#666] text-xs font-medium uppercase tracking-wider mb-2 hidden sm:flex">
              <div className="w-8 text-center">#</div>
              <div className="flex-1">Title</div>
              <div className="w-24 text-center">Rating</div>
              <div className="w-32 text-right pr-4">Added</div>
              <div className="w-10"></div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {list.movies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-gray-300 dark:border-[#2a2a2a] rounded-2xl bg-white/50 dark:bg-[#1a1a1a]/50">
                <span className="text-4xl mb-4">🪹</span>
                <h3 className="text-gray-900 dark:text-white font-semibold mb-1">This list is empty</h3>
                <Link to="/catalog" className="mt-4 px-6 py-2 bg-[#e50914] text-white text-sm font-bold rounded-xl hover:bg-red-600 shadow-md">Browse Catalog</Link>
              </div>
            ) : (
              list.movies.map((movie, index) => (
                <div key={movie.id} className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white dark:hover:bg-[#1a1a1a] transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-[#2a2a2a]">
                  <div className="w-8 text-center text-gray-500 dark:text-[#666] font-medium text-sm group-hover:text-gray-900 dark:group-hover:text-white">{index + 1}</div>
                  <div className="flex-1 flex items-center gap-4 min-w-0">
                    <Link to={`/movie/${movie.id}`} className="shrink-0">
                      <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded-md shadow-md" />
                    </Link>
                    <div className="flex flex-col min-w-0">
                      <Link to={`/movie/${movie.id}`} className="text-gray-900 dark:text-white text-sm font-bold truncate hover:underline underline-offset-2">{movie.title}</Link>
                      <div className="flex items-center gap-1.5 mt-0.5 text-gray-500 dark:text-[#8c8c8c] text-xs">
                        <span>{movie.year}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-[#444]" />
                        <span className="truncate">{movie.genres}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24 flex items-center justify-center gap-1 hidden sm:flex">
                    <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    <span className="text-gray-900 dark:text-white text-sm font-bold">{movie.rating.toFixed(1)}</span>
                  </div>
                  <div className="w-32 text-right text-gray-500 dark:text-[#666] text-xs hidden sm:block pr-4">{new Date(movie.addedAt).toLocaleDateString()}</div>
                  <div className="w-10 flex justify-end shrink-0">
                    {list.ownerId === user?.id && (
                      <button 
                        onClick={() => handleRemoveMovie(movie.id)} 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#e50914] transition-all opacity-0 group-hover:opacity-100"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
