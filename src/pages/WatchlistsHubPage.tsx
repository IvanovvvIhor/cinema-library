// src/pages/WatchlistsHubPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { selectUserLists, initializeUserLists } from "../store/watchlistSlice";
import { CreateListModal } from "../components/CreateListModal/CreateListModal";

export const WatchlistsHubPage: React.FC = () => {
  // #region Хуки та Диспетчер
  const dispatch = useAppDispatch();
  // #endregion

  // #region Селектори Redux
  const user = useAppSelector((state) => state.auth.user);
  const userLists = useAppSelector((state) => selectUserLists(state, user?.id));
  // #endregion

  // #region Локальний Стейт
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // #endregion

  // #region Effects (Ефекти)
  // Автоматична ініціалізація стандартних списків (Watched, Favorites тощо) при вході
  useEffect(() => {
    if (user) {
      dispatch(initializeUserLists(user.id));
    }
  }, [user, dispatch]);
  // #endregion

  // #region Перевірка авторизації (Ранній вихід)
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white transition-colors duration-300">
        <p>Please log in to view your watchlists.</p>
      </div>
    );
  }
  // #endregion

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111] overflow-y-auto transition-colors duration-300">
      
      {/* Модальне вікно створення нового списку */}
      {isCreateModalOpen && (
        <CreateListModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#222] px-8 py-6 transition-colors duration-300">
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight transition-colors duration-300">My Library</h1>
        <p className="text-gray-500 dark:text-[#8c8c8c] text-sm mt-1 transition-colors duration-300">Manage your lists and discover new collections.</p>
      </header>

      <div className="px-8 py-8 flex flex-col gap-12">
        
        {/* USER LISTS SECTION - Секція власних списків користувача */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 dark:text-white text-lg font-semibold flex items-center gap-2 transition-colors duration-300">
              <span>📚</span> Your Lists
            </h2>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="text-sm font-medium text-[#e50914] hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              + Create List
            </button>
          </div>

          {/* Grid для карток списків */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userLists.map((list) => (
              <Link 
                key={list.id} 
                to={`/WatchList/${list.id}`} 
                className="group flex flex-col bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-[#444] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-none"
              >
                {/* Обкладинка списку з ефектом блюру */}
                <div className="h-32 bg-gray-100 dark:bg-[#222] relative overflow-hidden flex items-center justify-center transition-colors duration-300">
                  {list.movies.length > 0 && list.movies[0].posterUrl ? (
                    <>
                      <img src={list.movies[0].posterUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-40 blur-md scale-110 transition-opacity duration-300" />
                      <img src={list.movies[0].posterUrl} alt="Cover" className="h-[80%] object-cover z-10 shadow-lg dark:shadow-2xl rounded transition-shadow duration-300" />
                    </>
                  ) : (
                    <span className="text-4xl opacity-20 dark:opacity-10 transition-opacity duration-300">🎬</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1a1a1a] via-transparent to-transparent opacity-80 dark:opacity-60 transition-colors duration-300" />
                </div>

                {/* Інформаційна частина картки */}
                <div className="p-4 flex flex-col gap-1 relative z-10 bg-white dark:bg-[#1a1a1a] transition-colors duration-300">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-gray-900 dark:text-white font-bold truncate group-hover:text-[#e50914] transition-colors duration-300">{list.title}</h3>
                    {list.visibility === 'Private' ? (
                      <svg className="w-3.5 h-3.5 text-gray-400 dark:text-[#444] shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-[#e50914] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-[#8c8c8c] text-[11px] line-clamp-1 h-4 transition-colors duration-300">{list.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                     <span className="text-[10px] font-bold text-gray-400 dark:text-[#444] uppercase tracking-widest transition-colors duration-300">
                       {list.movies.length} {list.movies.length === 1 ? 'title' : 'titles'}
                     </span>
                     <span className="text-[10px] text-[#e50914] opacity-0 group-hover:opacity-100 transition-opacity">View List →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PUBLIC LISTS SECTION - Заглушка для майбутніх публічних списків */}
        <section className="border-t border-gray-200 dark:border-[#222] pt-8 mb-12 transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 dark:text-white text-lg font-semibold flex items-center gap-2 transition-colors duration-300">
              <span>🌍</span> Discover Public Lists
            </h2>
          </div>
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 dark:border-[#222] rounded-3xl transition-colors duration-300">
            <p className="text-gray-500 dark:text-[#444] text-sm font-medium transition-colors duration-300">Community collections will appear here soon.</p>
          </div>
        </section>
      </div>
    </div>
  );
};