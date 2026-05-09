import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MovieCard } from "../components/MovieCard/MovieCard";
import { BulkAddToListPopover } from "../components/BulkAddToListPopover/BulkAddToListPopover"; // ПЕРЕКОНАЙСЯ ЩО СТВОРИВ ЦЕЙ ФАЙЛ
import type { Movie } from "../types/Movie";
import { fetchMovies } from "../services/api";

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
}

const GENRE_MAP: Record<string, string> = {
  "Action": "28", "Drama": "18", "Sci-Fi": "878", "Horror": "27",
  "Thriller": "53", "Fantasy": "14", "Romance": "10749", "Western": "37", "Comedy": "35", "Documentary": "99"
};

const GENRE_FILTERS = ["Action", "Drama", "Sci-Fi", "Horror", "Thriller", "Fantasy", "Romance", "Western", "Comedy", "Documentary"];
const ITEMS_PER_UI_PAGE = 12;

export const CatalogPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const activeGenres = searchParams.get('genres') ? searchParams.get('genres')!.split(',') : [];
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  
  const [loadedMovies, setLoadedMovies] = useState<Movie[]>([]);
  const [uiPage, setUiPage] = useState(1);
  const [tmdbPage, setTmdbPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreTMDB, setHasMoreTMDB] = useState(true);

  // СТЕЙТ ДЛЯ МАСОВОГО ВИДІЛЕННЯ
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkPopoverOpen, setIsBulkPopoverOpen] = useState(false); // СТЕЙТ ДЛЯ ПОПОВЕРА

  const SORT_OPTIONS = [
    { label: t('catalog.sort.popularity'), value: "popularity.desc" },
    { label: t('catalog.sort.ratingDesc'), value: "vote_average.desc" },
    { label: t('catalog.sort.ratingAsc'), value: "vote_average.asc" },
    { label: t('catalog.sort.newest'), value: "primary_release_date.desc" },
    { label: t('catalog.sort.oldest'), value: "primary_release_date.asc" },
  ];

  const SUB_NAV_LINKS = [
    { to: "/catalog",             label: t('catalog.all') },
    { to: "/catalog/topRated",    label: t('catalog.topRated') },
    { to: "/catalog/newReleases", label: t('catalog.newReleases') },
  ];

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
    setIsBulkPopoverOpen(false);
  };

  // Функція для отримання масиву вибраних об'єктів фільмів
  const getSelectedMoviesObjects = () => {
    return loadedMovies.filter(m => selectedIds.includes(m.id));
  };

  const fetchBatch = async (pageToFetch: number) => {
    let endpoint = `/discover/movie?sort_by=${sortBy}&vote_count.gte=100`;
    if (location.pathname.includes('topRated')) {
      endpoint = `/discover/movie?sort_by=vote_average.desc&vote_count.gte=1000`;
    } else if (location.pathname.includes('newReleases')) {
      endpoint = `/discover/movie?sort_by=primary_release_date.desc&primary_release_year=${new Date().getFullYear()}&vote_count.gte=10`;
    }

    if (search) {
      endpoint = `/search/movie?query=${encodeURIComponent(search)}`;
    } else if (activeGenres.length > 0) {
      endpoint += `&with_genres=${activeGenres.map(g => GENRE_MAP[g]).join(',')}`;
    }

    const { results, totalPages } = await fetchMovies(endpoint, pageToFetch);
    const formatted: Movie[] = results.map((m: TMDBMovie) => ({
      id: m.id, title: m.title, year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
      genre: activeGenres.length > 0 ? activeGenres[0] : "Movie", rating: m.vote_average,
      posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined
    }));
    return { formatted, totalPages };
  };

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true); setUiPage(1); setTmdbPage(1);
      const { formatted, totalPages } = await fetchBatch(1);
      setLoadedMovies(formatted); setHasMoreTMDB(totalPages > 1); setIsLoading(false);
    };
    const timer = setTimeout(() => loadInitial(), 400);
    return () => clearTimeout(timer);
  }, [searchParams, search, sortBy, location.pathname, i18n.language]);

  const toggleGenre = (genre: string) => {
    const newGenres = activeGenres.includes(genre) ? activeGenres.filter(g => g !== genre) : [...activeGenres, genre];
    if (newGenres.length === 0) searchParams.delete('genres'); else searchParams.set('genres', newGenres.join(','));
    setSearchParams(searchParams);
  };

  const handleNextPage = async () => {
    const nextUiPage = uiPage + 1;
    if (nextUiPage * ITEMS_PER_UI_PAGE > loadedMovies.length && hasMoreTMDB) {
      setIsLoading(true);
      const { formatted, totalPages } = await fetchBatch(tmdbPage + 1);
      setLoadedMovies(prev => [...prev, ...formatted]);
      setTmdbPage(prev => prev + 1);
      setHasMoreTMDB(tmdbPage + 1 < totalPages);
      setIsLoading(false);
    }
    setUiPage(nextUiPage);
  };

  const startIndex = (uiPage - 1) * ITEMS_PER_UI_PAGE;
  const displayMovies = loadedMovies.slice(startIndex, startIndex + ITEMS_PER_UI_PAGE);

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 dark:bg-[#111] overflow-hidden transition-colors relative">
      <header className="shrink-0 z-10 bg-white dark:bg-[#111] border-b border-gray-200 dark:border-[#222] px-8 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">
              {isSelectionMode ? `${t('catalog.selected', 'Selected')}: ${selectedIds.length}` : t('catalog.title')}
            </h1>
            {!isSelectionMode ? (
              <button onClick={() => setIsSelectionMode(true)} className="text-xs font-bold text-[#e50914] hover:underline uppercase tracking-wider">
                {t('catalog.selectMultiple', 'Select Multiple')}
              </button>
            ) : (
              <button onClick={cancelSelection} className="text-xs font-bold text-gray-500 hover:underline uppercase tracking-wider">
                {t('catalog.cancel', 'Cancel')}
              </button>
            )}
            {!isSelectionMode && (
              <nav className="flex items-center gap-1 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-1">
                {SUB_NAV_LINKS.map((link) => (
                  <NavLink key={link.to} to={link.to} end className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? "bg-[#e50914] text-white shadow-md" : "text-gray-600 dark:text-[#8c8c8c] hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"}`}>{link.label}</NavLink>
                ))}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <img src="/images/icons/Search.png" alt="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('catalog.searchPlaceholder')} className="w-full bg-gray-100 dark:bg-[#1c1c1c] border border-transparent rounded-full px-4 py-2 pl-10 text-gray-900 dark:text-white text-[13px] outline-none transition-colors focus:border-[#e50914]" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-gray-100 dark:bg-[#1c1c1c] border border-transparent text-gray-700 dark:text-[#8c8c8c] text-[13px] rounded-full px-4 py-2 outline-none cursor-pointer">
              {SORT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => {searchParams.delete('genres'); setSearchParams(searchParams);}} className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${activeGenres.length === 0 ? "bg-[#e50914] border-[#e50914] text-white shadow-md" : "bg-transparent border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-[#8c8c8c]"}`}>{t('catalog.all')}</button>
          {GENRE_FILTERS.map((genre) => (
            <button key={genre} onClick={() => toggleGenre(genre)} className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${activeGenres.includes(genre) ? "bg-[#e50914] border-[#e50914] text-white shadow-md" : "bg-transparent border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-[#8c8c8c]"}`}>{t(`genres.${genre}`)}</button>
          ))}
        </div>
      </header>

      <div className="flex-1 px-8 py-5 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2">
          {isLoading && displayMovies.length === 0 ? (
            <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div></div>
          ) : displayMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-4">
              {displayMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} isSelectionMode={isSelectionMode} isSelected={selectedIds.includes(movie.id)} onToggleSelection={toggleSelection} />
              ))}
            </div>
          ) : (<p className="text-center text-gray-500 mt-10">{t('catalog.noMovies')}</p>)}
        </div>

        {!isSelectionMode && loadedMovies.length > 0 && (
          <div className="shrink-0 mt-4 pt-4 border-t border-gray-200 dark:border-[#222] flex items-center justify-center gap-6">
            <button onClick={() => setUiPage(prev => Math.max(prev - 1, 1))} disabled={uiPage === 1} className="text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors font-medium text-sm">← {t('catalog.prev')}</button>
            <span className="text-gray-900 dark:text-white text-sm font-bold bg-gray-100 dark:bg-[#1c1c1c] px-4 py-1.5 rounded-lg border border-gray-200 dark:border-[#2a2a2a]">{t('catalog.page')} {uiPage}</span>
            <button onClick={handleNextPage} disabled={displayMovies.length < ITEMS_PER_UI_PAGE && !hasMoreTMDB} className="text-[#e50914] hover:text-red-600 disabled:opacity-30 transition-colors font-medium text-sm">{t('catalog.next')} →</button>
          </div>
        )}
      </div>

      {/* FLOATING ACTION BAR */}
      {isSelectionMode && selectedIds.length > 0 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 backdrop-blur-xl relative">
            
            {/* BULK POPOVER - ВІДКРИВАЄТЬСЯ НАД БАРОМ */}
            {isBulkPopoverOpen && (
              <BulkAddToListPopover 
                movies={getSelectedMoviesObjects()} 
                onClose={() => {
                  setIsBulkPopoverOpen(false);
                  cancelSelection(); // Закриваємо режим вибору після успішного додавання
                }} 
              />
            )}

            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white text-sm font-bold">{selectedIds.length} {t('catalog.moviesSelected', 'movies selected')}</span>
              <button onClick={() => setSelectedIds([])} className="text-[10px] text-[#e50914] font-bold uppercase text-left hover:underline">Deselect all</button>
            </div>
            
            <div className="h-8 w-px bg-gray-200 dark:bg-[#333]" />
            
            <button 
              className={`flex items-center gap-2 px-4 py-2 bg-[#e50914] text-white text-xs font-bold rounded-xl hover:bg-red-600 transition ${isBulkPopoverOpen ? 'ring-2 ring-white' : ''}`}
              onClick={() => setIsBulkPopoverOpen(!isBulkPopoverOpen)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              {t('catalog.addToWatchlist', 'Add to Lists')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};