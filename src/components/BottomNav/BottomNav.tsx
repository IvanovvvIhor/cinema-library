import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../store/hooks";

export const BottomNav: React.FC = () => {
  // #region Хуки та Навігація
  const { t } = useTranslation();
  const navigate = useNavigate();
  // #endregion

  // #region Селектори Redux
  const user = useAppSelector((state) => state.auth.user);
  // #endregion

  // #region Допоміжні методи стилізації (Helper Methods)
  const getIconClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 w-14 transition-all duration-300 ${
      isActive 
        ? "text-[#e50914] scale-110" 
        : "text-gray-500 dark:text-[#8c8c8c] hover:text-gray-900 dark:hover:text-gray-300"
    }`;
  // #endregion

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#111]/95 backdrop-blur-lg border-t border-gray-200 dark:border-[#222] px-4 pb-safe flex justify-between items-center h-[70px] z-50 transition-colors duration-300">
      
      {/* 1. Home */}
      <NavLink to="/catalog" className={getIconClass} end>
        {({ isActive }) => (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{t('sidebar.catalog')}</span>
          </>
        )}
      </NavLink>

      {/* 2. Top Rated */}
      <NavLink to="/catalog/topRated" className={getIconClass}>
        {({ isActive }) => (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.148.621-.531 1.115-1.071.8l-4.755-2.75a.562.562 0 00-.54 0l-4.755 2.75c-.54.315-1.219-.179-1.071-.8l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{t('sidebar.topRated')}</span>
          </>
        )}
      </NavLink>

      {/* 3. Центральна кнопка дії - ІКОНКА НАЛАШТУВАНЬ (Шестерня) */}
      <div className="relative -top-4">
        <button 
          onClick={() => navigate('/settings')}
          className="w-[56px] h-[52px] bg-[#e50914] rounded-2xl flex items-center justify-center text-white shadow-[0_8px_20px_rgba(229,9,20,0.4)] active:scale-90 active:rotate-45 transition-all duration-300"
        >
          {/* SVG іконка шестерні (Settings) */}
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* 4. Watchlist */}
      <NavLink to="/WatchList" className={getIconClass}>
        {({ isActive }) => (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{t('sidebar.watchlist')}</span>
          </>
        )}
      </NavLink>

      {/* 5. Profile / Settings */}
      <NavLink to={user ? "/profile" : "/settings"} className={getIconClass}>
        {({ isActive }) => (
          <>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {user ? t('sidebar.profile') : t('sidebar.settings')}
            </span>
          </>
        )}
      </NavLink>

    </nav>
  );
};