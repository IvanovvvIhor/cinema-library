import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMovieDetails } from "../services/api";
import { useAppSelector } from "../store/hooks";
import { AddToListPopover } from "../components/AddToListPopover/AddToListPopover";
import { useTranslation } from "react-i18next";

// #region Типи та Інтерфейси
interface Genre {
  id: number;
  name: string;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Video {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

interface Review {
  id: string;
  movieId: string;
  movieTitle?: string;
  moviePoster?: string;
  userId: string;
  username: string;
  avatar: string;
  text: string;
  date: number;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
}

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
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: Video[];
  };
}
// #endregion

export const MovieDetailsPage: React.FC = () => {
  // #region Хуки та Параметри
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((state) => state.auth.user);
  const { t, i18n } = useTranslation();
  // #endregion

  // #region Стейт: Дані фільму та інтерфейс
  const [movie, setMovie] = useState<ExtendedMovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  // #endregion

  // #region Стейт: Рецензії та форми
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  // #endregion

  // #region Ефекти: Завантаження даних
  useEffect(() => {
    const loadMovieAndReviews = async () => {
      setIsLoading(true);
      if (id) {
        // Отримання деталей фільму через API
        const data = await fetchMovieDetails(id);
        setMovie(data);

        // Отримання рецензій з локального сховища
        const allReviews: Review[] = JSON.parse(localStorage.getItem('cinema_reviews_db') || '[]');
        const movieReviews = allReviews
          .filter(r => r.movieId === id)
          .sort((a, b) => b.date - a.date);
        setReviews(movieReviews);
      }
      setIsLoading(false);
    };
    loadMovieAndReviews();
  }, [id, i18n.language]);
  // #endregion

  // #region Обробники: Керування рецензіями
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !movie) return;

    if (newReviewText.trim().length < 30) {
      setReviewError(t('movieDetails.reviewTooShort') || "Review is too short. Minimum 30 characters.");
      return;
    }

    const newReview: Review = {
      id: crypto.randomUUID(),
      movieId: id,
      movieTitle: movie.title, 
      moviePoster: movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : undefined,
      userId: user.id,
      username: user.username,
      avatar: user.avatar || "",
      text: newReviewText.trim(),
      date: Date.now(),
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    };

    const allReviews: Review[] = JSON.parse(localStorage.getItem('cinema_reviews_db') || '[]');
    allReviews.push(newReview);
    localStorage.setItem('cinema_reviews_db', JSON.stringify(allReviews));

    setReviews([newReview, ...reviews]);
    setNewReviewText("");
    setReviewError("");
  };
  // #endregion

  // #region Обробники: Система голосування
  const handleVote = (reviewId: string, type: 'like' | 'dislike') => {
    if (!user) {
      alert(t('movieDetails.loginToReview') || "You must be logged in to vote.");
      return;
    }

    const allReviews: Review[] = JSON.parse(localStorage.getItem('cinema_reviews_db') || '[]');
    
    const updatedReviews = allReviews.map(r => {
      if (r.id === reviewId) {
        // Користувач не може голосувати за власну рецензію
        if (r.userId === user.id) return r;

        let { likedBy, dislikedBy } = r;
        likedBy = likedBy || [];
        dislikedBy = dislikedBy || [];

        const hasLiked = likedBy.includes(user.id);
        const hasDisliked = dislikedBy.includes(user.id);

        if (type === 'like') {
          if (hasLiked) {
            likedBy = likedBy.filter(userId => userId !== user.id); 
          } else {
            likedBy.push(user.id); 
            dislikedBy = dislikedBy.filter(userId => userId !== user.id); 
          }
        } else if (type === 'dislike') {
          if (hasDisliked) {
            dislikedBy = dislikedBy.filter(userId => userId !== user.id); 
          } else {
            dislikedBy.push(user.id); 
            likedBy = likedBy.filter(userId => userId !== user.id); 
          }
        }

        return {
          ...r,
          likedBy,
          dislikedBy,
          likes: likedBy.length,
          dislikes: dislikedBy.length
        };
      }
      return r;
    });

    localStorage.setItem('cinema_reviews_db', JSON.stringify(updatedReviews));
    setReviews(updatedReviews.filter(r => r.movieId === id).sort((a, b) => b.date - a.date));
  };
  // #endregion

  // #region Форматування та Фолбеки (Fallback)
  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#111] min-h-screen transition-colors duration-300">
      <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!movie) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111] min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4">{t('movieDetails.notFound')}</h2>
      <Link to="/catalog" className="text-[#e50914] hover:underline">← {t('movieDetails.backToCatalog')}</Link>
    </div>
  );

  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '';
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined;
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const hours = Math.floor(movie.runtime / 60);
  const minutes = movie.runtime % 60;

  const trailer = movie.videos?.results.find(vid => vid.site === "YouTube" && vid.type === "Trailer") || movie.videos?.results.find(vid => vid.site === "YouTube");
  // #endregion

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111] overflow-y-auto transition-colors duration-300 relative">
      
      {/* Модальне вікно трейлера */}
      {isTrailerOpen && trailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a2a]">
            <button onClick={() => setIsTrailerOpen(false)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors">✕</button>
            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`} title="YouTube video" allowFullScreen></iframe>
          </div>
        </div>
      )}

      {/* Головний банер фільму */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-end pb-16 px-12 transition-colors duration-300">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 dark:opacity-40 transition-opacity duration-300" style={{ backgroundImage: `url(${backdropUrl})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 dark:from-[#111] dark:via-[#111]/80 to-transparent transition-colors duration-300" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-gray-50/50 dark:from-[#111] dark:via-[#111]/50 to-transparent transition-colors duration-300" />

        <div className="relative z-10 flex gap-10 items-end max-w-6xl w-full">
          {posterUrl && <img src={posterUrl} alt={movie.title} className="w-64 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 border border-gray-200 dark:border-white/10 hidden md:block transition-all duration-300" />}
          
          <div className="flex flex-col gap-4">
            <h1 className="text-gray-900 dark:text-white text-5xl font-bold tracking-tight transition-colors duration-300">{movie.title}</h1>
            
            <div className="flex items-center gap-4 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <span className="flex items-center gap-1 text-yellow-500">⭐ {movie.vote_average.toFixed(1)}</span>
              <span>•</span><span>{releaseYear}</span><span>•</span><span>{hours}h {minutes}m</span><span>•</span>
              <div className="flex gap-2">
                {movie.genres.map((g: Genre) => <span key={g.id} className="px-2.5 py-0.5 rounded-md border border-gray-300 dark:border-white/20 text-xs transition-colors duration-300">{g.name}</span>)}
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-base max-w-3xl leading-relaxed mt-2 transition-colors duration-300">{movie.overview || t('movieDetails.noOverview')}</p>

            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => trailer ? setIsTrailerOpen(true) : alert(t('movieDetails.noTrailer'))}
                className={`px-8 py-3 font-bold rounded-xl transition shadow-lg ${trailer ? "bg-[#e50914] text-white hover:bg-red-600 shadow-red-600/20" : "bg-gray-300 dark:bg-[#2a2a2a] text-gray-500 dark:text-[#666] cursor-not-allowed"}`}
                disabled={!trailer}
              >
                ▶ Trailer
              </button>
              
              {user ? (
                <div className="relative">
                  <button onClick={() => setIsPopoverOpen(!isPopoverOpen)} className="px-8 py-3 bg-gray-200/80 dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-300/80 dark:hover:bg-white/20 transition backdrop-blur-md">+ Watchlist</button>
                  {isPopoverOpen && (
                    <div className="absolute top-full left-0 mt-2 z-50">
                      <AddToListPopover movie={{ id: movie.id, title: movie.title, year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0, genre: movie.genres[0]?.name || "Movie", rating: movie.vote_average, posterUrl: posterUrl || undefined }} onClose={() => setIsPopoverOpen(false)} />
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/" className="flex items-center px-8 py-3 bg-gray-200/80 dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-300/80 dark:hover:bg-white/20 transition backdrop-blur-md">
                  {t('movieDetails.signInToSave')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Секція акторського складу */}
      <section className="px-12 py-10 max-w-6xl">
        <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-6 transition-colors duration-300">{t('movieDetails.topCast')}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {movie.credits?.cast?.slice(0, 8).map((actor: CastMember) => (
            <div key={actor.id} className="min-w-[120px] flex flex-col gap-2">
              <div className="w-[120px] h-[180px] rounded-xl overflow-hidden bg-gray-200 dark:bg-[#222] transition-colors duration-300">
                {actor.profile_path ? <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-600 text-sm">No Photo</div>}
              </div>
              <div>
                <p className="text-gray-900 dark:text-white text-sm font-semibold truncate transition-colors duration-300">{actor.name}</p>
                <p className="text-gray-500 dark:text-[#8c8c8c] text-xs truncate transition-colors duration-300">{actor.character}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Секція відгуків */}
      <section className="px-12 py-10 max-w-6xl mb-12">
        <h2 className="text-gray-900 dark:text-white text-xl font-bold mb-6 transition-colors duration-300">{t('movieDetails.reviews')}</h2>

        {user ? (
          <form onSubmit={handleReviewSubmit} className="mb-10 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] p-6 rounded-2xl transition-colors duration-300">
            <div className="flex gap-4 mb-4">
              {user.avatar && !user.avatar.includes('ui-avatars') ? (
                <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 dark:border-[#333]" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e50914] to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{user.username.substring(0, 2).toUpperCase()}</div>
              )}
              <div className="flex-1">
                <textarea value={newReviewText} onChange={(e) => { setNewReviewText(e.target.value); setReviewError(""); }} placeholder={t('movieDetails.writeReview')} className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm outline-none transition-colors focus:border-[#e50914] dark:focus:border-[#e50914] placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none min-h-[100px]" />
                {reviewError && <p className="text-[#e50914] text-xs mt-2 font-medium">{reviewError}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2.5 bg-[#e50914] text-white text-sm font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!newReviewText.trim()}>{t('movieDetails.publishReview')}</button>
            </div>
          </form>
        ) : (
          <div className="mb-10 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-colors duration-300">
            <p className="text-gray-600 dark:text-[#8c8c8c] text-sm mb-3">{t('movieDetails.loginToReview')}</p>
            <Link to="/" className="px-6 py-2 bg-gray-200 dark:bg-[#2a2a2a] text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-[#333] transition-colors text-sm">Sign In</Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-[#666] text-sm italic transition-colors">{t('movieDetails.noReviewsYet')}</p>
          ) : (
            reviews.map((review) => {
              const hasLiked = user && (review.likedBy || []).includes(user.id);
              const hasDisliked = user && (review.dislikedBy || []).includes(user.id);
              const isOwnReview = user?.id === review.userId;

              return (
                <div key={review.id} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] p-5 rounded-2xl flex gap-4 transition-colors duration-300">
                  {review.avatar && !review.avatar.includes('ui-avatars') ? (
                    <img src={review.avatar} alt={review.username} className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200 dark:border-[#333]" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e50914] to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">{review.username.substring(0, 2).toUpperCase()}</div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-900 dark:text-white font-bold text-sm transition-colors">{review.username}</h4>
                      <span className="text-gray-400 dark:text-[#666] text-xs transition-colors">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-700 dark:text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap transition-colors mb-4">{review.text}</p>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleVote(review.id, 'like')}
                        disabled={isOwnReview}
                        title={isOwnReview ? "You cannot vote on your own review" : "Like"}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                          hasLiked 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500 border border-green-200 dark:border-green-800' 
                            : 'bg-gray-50 dark:bg-[#111] text-gray-500 dark:text-[#666] border border-gray-200 dark:border-[#333]'
                        } ${!isOwnReview && !hasLiked ? 'hover:text-green-600 dark:hover:text-green-500 hover:border-green-300 dark:hover:border-green-800' : ''} ${isOwnReview ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                        {review.likes || 0}
                      </button>

                      <button 
                        onClick={() => handleVote(review.id, 'dislike')}
                        disabled={isOwnReview}
                        title={isOwnReview ? "You cannot vote on your own review" : "Dislike"}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                          hasDisliked 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-500 border border-red-200 dark:border-red-800' 
                            : 'bg-gray-50 dark:bg-[#111] text-gray-500 dark:text-[#666] border border-gray-200 dark:border-[#333]'
                        } ${!isOwnReview && !hasDisliked ? 'hover:text-red-600 dark:hover:text-red-500 hover:border-red-300 dark:hover:border-red-800' : ''} ${isOwnReview ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7 7" />
                        </svg>
                        {review.dislikes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
