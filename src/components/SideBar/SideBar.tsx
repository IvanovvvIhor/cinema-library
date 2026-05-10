import React from "react";
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from "react-i18next"; 

export const SideBar: React.FC = () => {
  // #region Хуки та Параметри URL
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentGenres = searchParams.get('genres') || '';
  const { t } = useTranslation();
  // #endregion

  // #region Допоміжні методи стилізації (Helper Methods)
  const getBaseLinkClass = (path: string) => {
    const isActive = location.pathname === path || (path === '/catalog' && location.pathname === '/');
    return `flex items-center gap-3 px-4 py-2 rounded-xl text-[14px] font-medium transition-colors ${
      isActive 
        ? "bg-[#e50914] text-white shadow-md shadow-red-500/20" 
        : "text-gray-600 dark:text-[#8c8c8c] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white"
    }`;
  };

  const getGenreLinkClass = (genre: string) => {
    const isActive = currentGenres.includes(genre);
    return `flex items-center gap-3 px-4 py-2 rounded-xl text-[14px] font-medium transition-colors ${
      isActive 
        ? "bg-[#e50914] text-white shadow-md shadow-red-500/20" 
        : "text-gray-600 dark:text-[#8c8c8c] hover:bg-gray-100 dark:hover:bg-[#2a2a2a] hover:text-gray-900 dark:hover:text-white"
    }`;
  };

  const buildGenreUrl = (genre: string) => {
    const basePath = location.pathname.includes('/catalog') ? location.pathname : '/catalog';
    return `${basePath}?genres=${genre}`;
  };
  // #endregion

  return (
    <aside className="hidden md:flex w-[260px] h-screen bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#222] flex-col py-6 px-4 shrink-0 transition-colors duration-300 z-50">

      {/* LOGO & TITLE SECTION */}
      <div className="shrink-0 mb-8 px-2">
        <Link to={'/'} className="flex items-center gap-3 transition-opacity hover:opacity-80">
          {/* Логотип - завжди оригінального кольору */}
          <img 
            src="/images/Logo.svg" 
            alt="Logo" 
            className="w-10 h-10 object-contain" 
          />
          {/* Назва сайту - адаптується під тему */}
          <div className="flex flex-col">
            <span className="text-gray-900 dark:text-white font-black text-lg leading-none tracking-tight">
              Cinema
            </span>
            <span className="text-[#e50914] font-bold text-xs uppercase tracking-[0.2em] leading-tight">
              Library
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-grow overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
        
        {/* 1. DISCOVER */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-[#666] font-bold mb-2 px-4">
            {t('sidebar.discover')}
          </p>
          <ul className="flex flex-col gap-0.5">
            <li>
              <Link to={'/catalog'} className={getBaseLinkClass('/catalog')}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4.5 h-4.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                {t('sidebar.catalog')}
              </Link>
            </li>
            <li>
              <Link to={'/catalog/topRated'} className={getBaseLinkClass('/catalog/topRated')}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4.5 h-4.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.148.621-.531 1.115-1.071.8l-4.755-2.75a.562.562 0 00-.54 0l-4.755 2.75c-.54.315-1.219-.179-1.071-.8l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                {t('sidebar.topRated')}
              </Link>
            </li>
            <li>
              <Link to={'/catalog/newReleases'} className={getBaseLinkClass('/catalog/newReleases')}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4.5 h-4.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t('sidebar.newReleases')}
              </Link>
            </li>
            <li>
              <Link to={'/WatchList'} className={getBaseLinkClass('/WatchList')}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4.5 h-4.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                {t('sidebar.watchlist')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="h-px bg-gray-200 dark:bg-[#222] mx-4 my-4" />

        {/* 2. GENRES */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-[#666] font-bold mb-2 px-4">
            {t('sidebar.genres')}
          </p>
          <ul className="flex flex-col gap-0.5">
            <li><Link to={buildGenreUrl('Action')} className={getGenreLinkClass('Action')}><span className="text-base w-4.5 h-4.5 flex items-center justify-center shrink-0">🎬</span> {t('genres.ActionAndThriller')}</Link></li>
            <li><Link to={buildGenreUrl('Drama')} className={getGenreLinkClass('Drama')}><span className="text-base w-4.5 h-4.5 flex items-center justify-center shrink-0">🎭</span> {t('genres.Drama')}</Link></li>
            <li><Link to={buildGenreUrl('Sci-Fi')} className={getGenreLinkClass('Sci-Fi')}><span className="text-base w-4.5 h-4.5 flex items-center justify-center shrink-0">🚀</span> {t('genres.SciFiAndFantasy')}</Link></li>
            <li><Link to={buildGenreUrl('Comedy')} className={getGenreLinkClass('Comedy')}><span className="text-base w-4.5 h-4.5 flex items-center justify-center shrink-0">😂</span> {t('genres.Comedy')}</Link></li>
            <li><Link to={buildGenreUrl('Horror')} className={getGenreLinkClass('Horror')}><span className="text-base w-4.5 h-4.5 flex items-center justify-center shrink-0">👻</span> {t('genres.Horror')}</Link></li>
            <li><Link to={buildGenreUrl('Documentary')} className={getGenreLinkClass('Documentary')}><span className="text-base w-4.5 h-4.5 flex items-center justify-center shrink-0">🏆</span> {t('genres.Documentary')}</Link></li>
          </ul>
        </div>

        <div className="h-px bg-gray-200 dark:bg-[#222] mx-4 my-4" />

        {/* 3. MY SPACE */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 dark:text-[#666] font-bold mb-2 px-4">
            {t('sidebar.mySpace')}
          </p>
          <ul className="flex flex-col gap-0.5 pb-2">
            <li>
              <Link to={'/profile'} className={getBaseLinkClass('/profile')}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4.5 h-4.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                {t('sidebar.profile')}
              </Link>
            </li>
            <li>
              <Link to={'/settings'} className={getBaseLinkClass('/settings')}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4.5 h-4.5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-2.25l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                {t('sidebar.settings')}
              </Link>
            </li>
          </ul>
        </div>
      </nav>

    </aside>
  );
};