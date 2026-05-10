/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MovieCard } from "../components/MovieCard/MovieCard";
import type { Movie } from "../types/Movie";
import { fetchMovies } from "../services/api";
import { AuthModal } from "../components/AuthModal/AuthModal";
import { useAppSelector } from "../store/hooks";

// #region Типи та Інтерфейси
interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
}
// #endregion

export const HomePage: React.FC = () => {
  // #region Стейт та Селектори
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const user = useAppSelector((state) => state.auth.user);
  const isGuest = useAppSelector((state) => state.auth.isGuest);
  // #endregion

  // #region Effects (Побічні ефекти)
  
  // Керування модальним вікном авторизації
  useEffect(() => {
    const modal = !user && !isGuest;
    setShowAuthModal(modal);
  }, [user, isGuest]);

  // Завантаження трендових фільмів
  useEffect(() => {
    const loadTrendingMovies = async () => {
      setIsLoading(true);
      const { results } = await fetchMovies('/movie/popular');

      const topFour: Movie[] = results.slice(0, 4).map((m: TMDBMovie) => ({
        id: m.id,
        title: m.title,
        year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
        genre: "Trending",
        rating: m.vote_average,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined
      }));

      setTrendingMovies(topFour);
      setIsLoading(false);
    };

    loadTrendingMovies();
  }, []);
  // #endregion

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111] overflow-y-auto transition-colors duration-300">
      
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <section className="relative px-8 py-16 flex flex-col gap-4 overflow-hidden border-b border-gray-200 dark:border-[#222] transition-colors duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 dark:from-red-950/30 via-transparent to-transparent pointer-events-none transition-colors duration-300" />
        <div className="relative">
          <p className="text-[#e50914] text-xs font-bold uppercase tracking-widest mb-3">
            {user ? `Welcome back, ${user.username}` : 'Welcome to Cinema'}
          </p>
          <h1 className="text-gray-900 dark:text-white text-4xl font-bold leading-tight mb-4 transition-colors duration-300">
            Your personal<br />
            <span className="text-[#e50914]">Cinema Library</span>
          </h1>
          <p className="text-gray-600 dark:text-[#8c8c8c] text-sm max-w-md leading-relaxed mb-8 transition-colors duration-300">
            Discover, rate, and catalog films. Build watchlists, track your reviews, and earn badges as you explore cinema.
          </p>
          <div className="flex items-center gap-3">
            <Link to="/catalog" className="px-6 py-3 bg-[#e50914] text-white text-sm font-semibold rounded-xl transition hover:bg-red-600 shadow-lg shadow-red-600/20">
              Browse Catalog
            </Link>
            
            {user ? (
              <Link to="/WatchList" className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-[#8c8c8c] text-sm font-semibold rounded-xl transition hover:border-gray-300 dark:hover:border-[#444] hover:text-gray-900 dark:hover:text-white shadow-sm">
                My Watchlist
              </Link>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-[#8c8c8c] text-sm font-semibold rounded-xl transition hover:border-gray-300 dark:hover:border-[#444] hover:text-gray-900 dark:hover:text-white shadow-sm">
                Sign In to Save
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="px-8 py-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-gray-900 dark:text-white text-lg font-bold transition-colors duration-300">Trending Now</h2>
          <Link to="/catalog" className="text-gray-500 dark:text-[#8c8c8c] text-sm font-medium transition hover:text-gray-900 dark:hover:text-white">
            See all →
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pb-16">
            {trendingMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};