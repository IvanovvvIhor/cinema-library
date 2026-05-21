/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MovieCard } from "../components/MovieCard/MovieCard";
import type { Movie } from "../types/Movie";
import { fetchMovies } from "../services/api";

// #region Типи та Константи
interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
}

const GENRE_MAP: Record<string, string> = {
  "Action": "28", "Drama": "18", "Sci-Fi": "878", "Horror": "27",
  "Thriller": "53", "Fantasy": "14", "Romance": "10749", "Western": "37", 
  "Comedy": "35", "Documentary": "99"
};

const GENRE_FILTERS = ["Action", "Drama", "Sci-Fi", "Horror", "Thriller", "Fantasy", "Romance", "Western", "Comedy", "Documentary"];
const ITEMS_PER_UI_PAGE = 12;
// #endregion

export const CatalogPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL - Єдине джерело істини
  const targetPage = parseInt(searchParams.get('page') || '1', 10);
  const activeGenres = searchParams.get('genres') ? searchParams.get('genres')!.split(',') : [];
  
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");

  const [loadedMovies, setLoadedMovies] = useState<Movie[]>([]);
  const [uiPage, setUiPage] = useState(targetPage);
  const [totalUiPages, setTotalUiPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Кешування стану між рендерами для розумного завантаження
  const loadedMoviesRef = useRef<Movie[]>([]);
  const tmdbPageRef = useRef<number>(1);
  const hasMoreRef = useRef<boolean>(true);
  
  // Унікальний ключ фільтрів. Якщо він міняється — кеш скидається
  const filterKey = `${activeGenres.join(',')}|${search}|${sortBy}|${location.pathname}|${i18n.language}`;
  const filterKeyRef = useRef<string>(filterKey);

  // #region Логіка завантаження
  const fetchBatch = async (pageToFetch: number) => {
    let endpoint = `/discover/movie?sort_by=${sortBy}&vote_count.gte=100`;
    if (location.pathname.includes('topRated')) endpoint = `/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000`;
    else if (location.pathname.includes('newReleases')) endpoint = `/discover/movie?sort_by=primary_release_date.desc&primary_release_year=${new Date().getFullYear()}&vote_count.gte=10`;

    if (search) endpoint = `/search/movie?query=${encodeURIComponent(search)}`;
    else if (activeGenres.length > 0) endpoint += `&with_genres=${activeGenres.map(g => GENRE_MAP[g]).join(',')}`;

    const { results, totalPages } = await fetchMovies(endpoint, pageToFetch);
    const formatted: Movie[] = results.map((m: TMDBMovie) => ({
      id: m.id,
      title: m.title,
      year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
      genre: activeGenres.length > 0 ? activeGenres[0] : "Movie",
      rating: m.vote_average,
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined,
      runtime: 0 
    }));
    return { formatted, totalPages };
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      if (filterKey !== filterKeyRef.current) {
        loadedMoviesRef.current = [];
        tmdbPageRef.current = 1;
        hasMoreRef.current = true;
        filterKeyRef.current = filterKey;
        
        if (targetPage !== 1) {
          searchParams.set('page', '1');
          setSearchParams(searchParams, { replace: true });
          return; 
        }
      }

      let movies = [...loadedMoviesRef.current];
      let currentTmdb = tmdbPageRef.current;
      let more = hasMoreRef.current;

      // Завантажуємо TMDB дані, доки не покриємо потрібну сторінку з URL
      while (targetPage * ITEMS_PER_UI_PAGE > movies.length && more) {
        const { formatted, totalPages } = await fetchBatch(currentTmdb);
        movies = [...movies, ...formatted];
        setTotalUiPages(Math.ceil((totalPages * 20) / ITEMS_PER_UI_PAGE));
        currentTmdb++;
        more = currentTmdb <= totalPages;
      }

      loadedMoviesRef.current = movies;
      tmdbPageRef.current = currentTmdb;
      hasMoreRef.current = more;

      setLoadedMovies(movies);
      setUiPage(targetPage);
      setIsLoading(false);
    };

    const timer = setTimeout(() => load(), search ? 500 : 0);
    return () => clearTimeout(timer);
  }, [targetPage, filterKey]);
  // #endregion

  // #region Хендлери користувача
  const toggleGenre = (genre: string) => {
    const newGenres = activeGenres.includes(genre) ? activeGenres.filter(g => g !== genre) : [...activeGenres, genre];
    if (newGenres.length === 0) searchParams.delete('genres'); 
    else searchParams.set('genres', newGenres.join(','));
    searchParams.set('page', '1'); 
    setSearchParams(searchParams);
  };

  const handlePageClick = (newPage: number) => {
    if (newPage === uiPage || newPage < 1 || newPage > totalUiPages) return;
    
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);

    const catalogContainer = document.getElementById('catalog-scroll-container');
    if (catalogContainer) catalogContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // #endregion

  const startIndex = (uiPage - 1) * ITEMS_PER_UI_PAGE;
  const displayMovies = loadedMovies.slice(startIndex, startIndex + ITEMS_PER_UI_PAGE);

  // #region UI Helpers
  const SUB_NAV_LINKS = [
    { to: "/catalog",             label: t('catalog.all') },
    { to: "/catalog/topRated",    label: t('catalog.topRated') },
    { to: "/catalog/newReleases", label: t('catalog.newReleases') },
  ];

  const SORT_OPTIONS = [
    { label: t('catalog.sort.popularity'), value: "popularity.desc" },
    { label: t('catalog.sort.ratingDesc'), value: "vote_average.desc" },
    { label: t('catalog.sort.ratingAsc'), value: "vote_average.asc" },
    { label: t('catalog.sort.newest'), value: "primary_release_date.desc" },
    { label: t('catalog.sort.oldest'), value: "primary_release_date.asc" },
  ];

  // РОЗШИРЕНА ПАГІНАЦІЯ (1 ... 4 5 6 7 8 ... N)
  const renderPageNumbers = () => {
    const total = totalUiPages;
    const current = uiPage;
    const delta = 2; // Кількість сторінок зліва/справа від поточної
    let range: number[] = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) range.push(i);

    if (current - delta <= 2) {
      range = [];
      for (let i = 2; i <= Math.min(total - 1, 6); i++) range.push(i);
    }
    
    if (current + delta >= total - 1) {
      range = [];
      for (let i = Math.max(2, total - 5); i <= total - 1; i++) range.push(i);
    }

    const pages: (number | string)[] = [];
    if (total > 0) pages.push(1); 
    if (range.length > 0 && range[0] > 2) pages.push('...'); 
    pages.push(...range); 
    if (range.length > 0 && range[range.length - 1] < total - 1) pages.push('...'); 
    if (total > 1) pages.push(total); 

    return pages.map((page, index) => {
      if (page === '...') {
        return <span key={`ellipsis-${index}`} className="px-1 text-gray-500 font-black tracking-widest">...</span>;
      }
      return (
        <button 
          key={page} 
          onClick={() => handlePageClick(page as number)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black uppercase transition-all border ${
            uiPage === page 
            ? "bg-[#e50914] text-white border-[#e50914] shadow-md scale-110" 
            : "bg-gray-100 dark:bg-[#1c1c1c] text-gray-600 dark:text-[#8c8c8c] border-gray-200 dark:border-[#2a2a2a] hover:border-[#e50914] hover:text-[#e50914]"
          }`}
        >
          {page}
        </button>
      );
    });
  };
  // #endregion

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 dark:bg-[#111] overflow-hidden transition-colors relative">
      <header className="shrink-0 z-10 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#222] px-4 md:px-8 py-4 flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-gray-900 dark:text-white text-xl font-black uppercase italic tracking-tighter whitespace-nowrap">
              {t('catalog.title')}
            </h1>
            <nav className="flex items-center gap-1 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-1 overflow-x-auto no-scrollbar">
              {SUB_NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end className={({ isActive }) => `px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-black uppercase italic transition-colors whitespace-nowrap ${isActive ? "bg-[#e50914] text-white shadow-md" : "text-gray-600 dark:text-[#8c8c8c] hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"}`}>{link.label}</NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <img src="images/icons/Search.png" alt="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('catalog.searchPlaceholder')} className="w-full bg-gray-100 dark:bg-[#1c1c1c] border border-transparent rounded-full px-4 py-2 pl-10 text-gray-900 dark:text-white text-[13px] font-bold outline-none transition-colors focus:border-[#e50914]" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-100 dark:bg-[#1c1c1c] border border-transparent text-gray-700 dark:text-[#8c8c8c] text-[13px] font-black uppercase italic rounded-full px-4 py-2 outline-none cursor-pointer shrink-0">
              {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <button onClick={() => {searchParams.delete('genres'); searchParams.set('page', '1'); setSearchParams(searchParams);}} className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase italic border transition-colors whitespace-nowrap ${activeGenres.length === 0 ? "bg-[#e50914] border-[#e50914] text-white shadow-md" : "bg-transparent border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-[#8c8c8c]"}`}>{t('catalog.all')}</button>
          {GENRE_FILTERS.map((genre) => (
            <button key={genre} onClick={() => toggleGenre(genre)} className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase italic border transition-colors whitespace-nowrap ${activeGenres.includes(genre) ? "bg-[#e50914] border-[#e50914] text-white shadow-md" : "bg-transparent border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-[#8c8c8c]"}`}>{t(`genres.${genre}`)}</button>
          ))}
        </div>
      </header>

      {/* Контейнер отримав id "catalog-scroll-container" для плавного повернення вгору при кліку на пагінацію */}
      <div className="flex-1 px-4 md:px-8 py-5 flex flex-col min-h-0">
        <div id="catalog-scroll-container" className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
          {isLoading && displayMovies.length === 0 ? (
            <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div></div>
          ) : displayMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-4">
              {displayMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (<p className="text-center text-gray-500 font-bold uppercase italic mt-10">{t('catalog.noMovies')}</p>)}
        </div>

        {loadedMovies.length > 0 && totalUiPages > 1 && (
          <div className="shrink-0 mt-4 pt-4 border-t border-gray-200 dark:border-[#222] flex items-center justify-center gap-4 pb-2">
            <button 
                onClick={() => handlePageClick(uiPage - 1)} 
                disabled={uiPage === 1} 
                className="text-gray-500 hover:text-[#e50914] disabled:opacity-30 disabled:hover:text-gray-500 font-black uppercase italic text-[10px] sm:text-xs transition-colors"
            >
                ← {t('catalog.prev')}
            </button>
            
            <div className="hidden sm:flex items-center gap-2">
                {renderPageNumbers()}
            </div>

            <span className="sm:hidden text-gray-900 dark:text-white text-xs font-black uppercase italic bg-gray-100 dark:bg-[#1c1c1c] px-4 py-1.5 rounded-lg border border-gray-200 dark:border-[#2a2a2a]">
                {uiPage} / {totalUiPages}
            </span>

            <button 
                onClick={() => handlePageClick(uiPage + 1)} 
                disabled={uiPage === totalUiPages} 
                className="text-[#e50914] hover:text-red-600 disabled:opacity-30 disabled:hover:text-[#e50914] font-black uppercase italic text-[10px] sm:text-xs transition-colors"
            >
                {t('catalog.next')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};