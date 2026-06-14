/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMovieDetails } from "../services/api";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "react-i18next";
import api from "../api/axios";

// Імпортуємо компоненти
import { ReviewForm } from "../components/ReviewForm";
import { MovieReviews } from "../components/MovieReviews";
import { AddToListPopover } from "../components/AddToListPopover";

// #region Інтерфейси
interface Genre { id: number; name: string; }
interface CastMember { id: number; name: string; character: string; profile_path: string | null; }

interface ExtendedMovieDetails {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  runtime: number;
  overview: string;
  genres: Genre[];
  credits?: { cast: CastMember[] };
  videos?: { results: any[] };
}
// #endregion

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const [movie, setMovie] = useState<ExtendedMovieDetails | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Стани для трейлера
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isTrailerErrorOpen, setIsTrailerErrorOpen] = useState(false);
  
  // Стан для Поповера списків
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const loadData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [movieData, reviewsRes] = await Promise.all([
        fetchMovieDetails(id),
        api.get('/reviews')
      ]);
      
      setMovie(movieData);
      const movieReviews = reviewsRes.data.filter((r: any) => String(r.movie_id) === String(id));
      setReviews(movieReviews);

    } catch (err) {
      console.error("Critical mission failure during data load:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user?.id]);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#111] min-h-screen">
      <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!movie) return <div className="text-white text-center mt-20 font-black uppercase italic tracking-widest">Target Asset Not Found</div>;

  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined;
  const trailer = movie.videos?.results.find(v => v.site === "YouTube" && v.type === "Trailer");

  // Обробник кліку на кнопку трейлера
  const handleTrailerClick = () => {
    if (trailer) {
      setIsTrailerOpen(true);
    } else {
      setIsTrailerErrorOpen(true);
    }
  };

// Обробник видалення рецензії (Виправлена типізація)
  const handleDeleteReview = async (reviewId: number) => {
    try {
      const token = localStorage.getItem('token');

      await api.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReviews(reviews.filter(r => r.id !== reviewId));
      
    } catch (err: any) {
      console.error("Помилка видалення рецензії:", err);
    }
  };
  
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111] transition-colors duration-300">
      
      {/* МОДАЛКА ТРЕЙЛЕРА */}
      {isTrailerOpen && trailer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a2a]">
            <button onClick={() => setIsTrailerOpen(false)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">✕</button>
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`} allowFullScreen title="trailer"></iframe>
          </div>
        </div>
      )}

      {/* МОДАЛКА ПОМИЛКИ (ТРЕЙЛЕР НЕ ЗНАЙДЕНО) */}
      {isTrailerErrorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transition-colors duration-300">
          <div className="relative w-full max-w-md bg-white dark:bg-[#111] rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-[#2a2a2a] text-center animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsTrailerErrorOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-[#e50914] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-[#e50914]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tighter">
              {t('movieDetails.noTrailerTitle', 'Трейлер не знайдено')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
              {t('movieDetails.noTrailerMessage', 'Трейлера фільму, озвученого обраною вами мовою, не знайдено. Спробуйте перейти на сторінку налаштувань, змінити мову та повторити спробу.')}
            </p>
            
            <button 
              onClick={() => setIsTrailerErrorOpen(false)} 
              className="w-full px-6 py-3 bg-[#e50914] text-white font-bold rounded-xl hover:bg-red-600 transition"
            >
              {t('common.close', 'Зрозуміло')}
            </button>
          </div>
        </div>
      )}

      {/* 1. BANNER SECTION */}
      <section className="relative w-full h-[500px] lg:h-[70vh] flex items-end pb-16 px-6 md:px-12">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity" style={{ backgroundImage: `url(${backdropUrl})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-[#111] via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-end max-w-6xl w-full mx-auto">
          {posterUrl && <img src={posterUrl} className="w-48 md:w-64 rounded-2xl shadow-2xl border border-white/10" alt={movie.title} />}
          <div className="flex-1 text-center md:text-left mb-4">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 uppercase italic tracking-tighter leading-tight">{movie.title}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-700 dark:text-gray-300 mb-6 font-bold uppercase text-[10px] tracking-[0.2em]">
               <span className="text-yellow-500">⭐ {movie.vote_average.toFixed(1)}</span>
               <span>{new Date(movie.release_date).getFullYear()}</span>
               <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            </div>
            <div className="flex gap-4 justify-center md:justify-start relative">
               
               {/* ЗМІНЕНО ОБРОБНИК КЛІКУ ТУТ */}
               <button onClick={handleTrailerClick} className="px-8 py-3 bg-[#e50914] text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-600/30">
                 ▶ Trailer
               </button>
               
               {user && (
                 <div className="relative">
                   <button 
                      onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                      className={`px-8 py-3 font-black uppercase tracking-widest rounded-xl transition backdrop-blur-md border border-white/10 flex items-center gap-2 ${
                          isPopoverOpen 
                          ? "bg-[#e50914] text-white" 
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                   >
                      + Watchlist
                   </button>

                   {/* ПОПОВЕР ДЛЯ ВИБОРУ СПИСКУ */}
                   {isPopoverOpen && (
                     <div className="absolute bottom-full left-0 mb-4 animate-in slide-in-from-bottom-2 fade-in duration-200 z-50">
                        <AddToListPopover 
                          movie={{
                            id: movie.id,
                            title: movie.title,
                            year: new Date(movie.release_date).getFullYear(),
                            rating: movie.vote_average,
                            posterUrl: posterUrl,
                            genre: movie.genres[0]?.name || "Movie",
                            runtime: movie.runtime 
                          }} 
                          onClose={() => setIsPopoverOpen(false)} 
                        />
                     </div>
                   )}
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. CAST SECTION */}
      <section className="py-10 max-w-6xl mx-auto w-full overflow-hidden">
        <h2 className="px-6 md:px-12 text-gray-900 dark:text-white text-xl font-black uppercase italic mb-6 border-l-4 border-[#e50914] tracking-tighter">
          {t('movieDetails.topCast', 'Strategic Personnel')}
        </h2>
        
        <div className="px-6 md:px-12 flex flex-nowrap gap-4 overflow-x-auto pb-6 scroll-smooth w-full after:content-[''] after:w-4 after:shrink-0 md:after:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {movie.credits?.cast?.slice(0, 8).map((actor: CastMember) => (
            <div key={actor.id} className="w-[120px] min-w-[120px] shrink-0 flex-none flex flex-col gap-2">
              <div className="w-[120px] h-[180px] rounded-xl overflow-hidden bg-gray-200 dark:bg-[#222] border border-white/5 shadow-md">
                {actor.profile_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} 
                    alt={actor.name} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center p-2 text-gray-500 text-[10px] font-black uppercase italic">
                    No Visual Data
                  </div>
                )}
              </div>
              <div className="px-1 text-center">
                <p className="text-gray-900 dark:text-white text-[11px] font-black uppercase truncate leading-tight" title={actor.name}>
                  {actor.name}
                </p>
                <p className="text-gray-500 text-[9px] font-bold uppercase truncate tracking-tighter" title={actor.character}>
                  {actor.character}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. REVIEWS SECTION */}
      <section className="px-6 md:px-12 py-12 max-w-6xl mx-auto w-full mb-20 bg-gray-50 dark:bg-[#0d0d0d] rounded-t-[3rem] shadow-2xl border-t border-gray-200 dark:border-white/5">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 italic uppercase tracking-tighter">
          {t('movieDetails.reviewsTitle', 'Community Debriefings')}
        </h2>

        {user ? (
          <ReviewForm 
            movieId={id!} 
            movieTitle={movie.title} 
            moviePoster={posterUrl || ""}
            user={user} 
            onReviewPublished={(newRev) => setReviews([newRev, ...reviews])} 
          />
        ) : (
          <div className="mb-12 p-8 bg-white dark:bg-[#111] rounded-2xl text-center border-2 border-dashed border-gray-200 dark:border-[#333]">
            <p className="text-gray-500 dark:text-[#8c8c8c] mb-4 text-[10px] font-black uppercase tracking-widest italic">Clearance level insufficient. Log in to contribute.</p>
            <Link to="/" className="inline-block px-8 py-2.5 bg-[#e50914] text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition shadow-lg">Authenticate</Link>
          </div>
        )}

        <MovieReviews 
          reviews={reviews} 
          currentUser={user} 
          onDelete={handleDeleteReview} 
        />
      </section>
    </div>
  );
};