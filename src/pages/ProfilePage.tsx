/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout } from "../store/authSlice";
import { selectUserLists } from "../store/watchlistSlice"; 
import { AuthModal } from "../components/AuthModal/AuthModal";
import { EditProfileModal } from "../components/EditProfileModal/EditProfileModal";
import { useTranslation } from "react-i18next"; // ДОДАНО ІМПОРТ

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
  likes?: number;    
  dislikes?: number; 
}

export const ProfilePage: React.FC = () => {
  const { user, isGuest } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation(); // ІНІЦІАЛІЗАЦІЯ ПЕРЕКЛАДУ
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const userLists = useAppSelector((state) => selectUserLists(state, user?.id));
  const [userReviews, setUserReviews] = useState<Review[]>([]);

  // Перенесли масив всередину компонента, щоб працював t()
  const ACHIEVEMENTS = [
    { icon: "🏆", name: t('profile.achievements.elite.name', 'Cinephile Elite'),  desc: t('profile.achievements.elite.desc', 'Watched 250+ films'),    earned: true  },
    { icon: "✍️", name: t('profile.achievements.critic.name', "Critic's Voice"),   desc: t('profile.achievements.critic.desc', 'Wrote 40+ reviews'),     earned: true  },
    { icon: "🎭", name: t('profile.achievements.explorer.name', 'Genre Explorer'), desc: t('profile.achievements.explorer.desc', '8 genres watched'),      earned: true  },
    { icon: "🌍", name: t('profile.achievements.world.name', 'World Cinema'),     desc: t('profile.achievements.world.desc', 'Watch 10 intl. films'),  earned: false },
  ];

  useEffect(() => {
    if (isGuest) navigate('/');
  }, [isGuest, navigate]);

  useEffect(() => {
    if (user) {
      const allReviews: Review[] = JSON.parse(localStorage.getItem('cinema_reviews_db') || '[]');
      const myReviews = allReviews
        .filter(r => r.userId === user.id)
        .sort((a, b) => b.date - a.date); 
      setUserReviews(myReviews);
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (isGuest) return null;

  if (!user) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111]">
        <AuthModal onClose={() => navigate('/')} />
      </div>
    );
  }

  const watchedList = userLists.find(l => l.title === 'Watched' && l.isDefault);
  const watchedCount = watchedList ? watchedList.movies.length : 0;
  const listsCount = userLists.length;
  const reviewsCount = userReviews.length;

  const reputation = userReviews.reduce((acc, review) => {
    const likes = review.likes || 0;
    const dislikes = review.dislikes || 0;
    return acc + (likes - dislikes);
  }, 0);

  const initials = user.username.substring(0, 2).toUpperCase();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111] overflow-y-auto transition-colors duration-300">

      {isEditModalOpen && (
        <EditProfileModal onClose={() => setIsEditModalOpen(false)} />
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#222] px-8 py-4 flex items-center justify-between transition-colors duration-300">
        <h1 className="text-gray-900 dark:text-white text-xl font-bold tracking-tight">{t('profile.title', 'Profile')}</h1>
        <div className="flex gap-3">
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-[#8c8c8c] text-sm rounded-xl transition hover:border-gray-300 dark:hover:border-[#444] hover:text-gray-900 dark:hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            {t('profile.editProfile', 'Edit Profile')}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/30 text-red-600 dark:text-[#e50914] hover:bg-red-600 hover:text-white dark:hover:bg-[#e50914] text-sm font-bold rounded-xl transition">
            {t('profile.logout', 'Log Out')}
          </button>
        </div>
      </header>

      <div className="px-8 py-8 flex flex-col gap-8 max-w-4xl">

        {/* PROFILE HEADER (Avatar & Info) */}
        <section className="flex items-center gap-6">
          {user.avatar && !user.avatar.includes('ui-avatars') ? (
            <img src={user.avatar} alt={user.username} className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-[#2a2a2a]" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e50914] to-yellow-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
              {initials}
            </div>
          )}
          
          <div className="flex flex-col gap-1">
            <h2 className="text-gray-900 dark:text-white text-2xl font-bold transition-colors">{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-gray-200 dark:bg-[#2a2a2a] text-gray-700 dark:text-[#8c8c8c] text-xs font-bold rounded-full transition-colors">
                {user.age} {t('profile.yo', 'y.o.')} • {user.gender}
              </span>
              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-400/10 border border-yellow-300 dark:border-yellow-400/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold rounded-full transition-colors">
                🏆 {t('profile.level', 'Level')} 1
              </span>
            </div>
            <p className="text-gray-500 dark:text-[#8c8c8c] text-sm mt-1 transition-colors">{user.email}</p>
          </div>
        </section>

        {/* ДИНАМІЧНА СТАТИСТИКА */}
        <section className="grid grid-cols-4 gap-4">
          {[
            { label: t('profile.stats.watched', "Watched"),  value: watchedCount, color: "text-[#e50914]" },
            { label: t('profile.stats.reviews', "Reviews"),  value: reviewsCount, color: "text-gray-900 dark:text-white" },
            { label: t('profile.stats.lists', "Lists"),    value: listsCount,   color: "text-gray-900 dark:text-white" },
            { label: t('profile.stats.reputation', "Reputation"), value: reputation > 0 ? `+${reputation}` : reputation, color: reputation > 0 ? "text-green-600 dark:text-green-400" : reputation < 0 ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-4 flex flex-col gap-1 transition-colors duration-300">
              <span className={`text-3xl font-bold transition-colors duration-300 ${s.color}`}>{s.value}</span>
              <span className="text-gray-500 dark:text-[#8c8c8c] text-xs transition-colors font-medium uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </section>

        {/* XP PROGRESS */}
        <section className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-3 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white text-sm font-semibold transition-colors">{t('profile.progressTitle', 'Level 1 Progress')}</span>
            <span className="text-gray-500 dark:text-[#8c8c8c] text-xs transition-colors">0 / 100 XP</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden transition-colors duration-300">
            <div className="h-full bg-gradient-to-r from-[#e50914] to-yellow-400 rounded-full transition-all" style={{ width: "5%" }} />
          </div>
          <span className="text-gray-400 dark:text-[#666] text-xs transition-colors">{t('profile.progressToNext', '100 XP to Level 2')}</span>
        </section>

        {/* ACHIEVEMENTS */}
        <section>
          <h3 className="text-gray-900 dark:text-white text-base font-semibold mb-4 transition-colors">{t('profile.achievementsTitle', 'Achievements (Coming Soon)')}</h3>
          <div className="grid grid-cols-2 gap-3 opacity-60 pointer-events-none">
            {ACHIEVEMENTS.map((a) => (
              <div key={a.name} className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors duration-300 ${a.earned ? "bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]" : "bg-gray-50 dark:bg-[#1a1a1a]/40 border-gray-100 dark:border-[#1f1f1f] opacity-50"}`}>
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white text-sm font-semibold transition-colors">{a.name}</p>
                  <p className="text-gray-500 dark:text-[#8c8c8c] text-xs transition-colors">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ДИНАМІЧНІ РЕЦЕНЗІЇ */}
        <section className="pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900 dark:text-white text-base font-semibold transition-colors">{t('profile.reviewsTitle', 'My Recent Reviews')}</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {userReviews.length === 0 ? (
              <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-6 text-center transition-colors">
                <p className="text-gray-500 dark:text-[#8c8c8c] text-sm">{t('profile.noReviews', "You haven't written any reviews yet.")}</p>
                <Link to="/catalog" className="text-[#e50914] text-sm font-semibold hover:underline mt-2 inline-block">{t('profile.explore', 'Explore movies')}</Link>
              </div>
            ) : (
              userReviews.slice(0, 3).map((r) => (
                <div key={r.id} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-4 flex gap-4 transition-colors duration-300">
                  
                  <div className="w-10 h-14 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg flex-shrink-0 flex items-center justify-center transition-colors overflow-hidden border border-gray-200 dark:border-[#333]">
                    {r.moviePoster ? (
                      <img src={r.moviePoster} alt={r.movieTitle || "Movie"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🎬</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Link to={`/movie/${r.movieId}`} className="text-gray-900 dark:text-white text-sm font-semibold hover:text-[#e50914] dark:hover:text-[#e50914] transition-colors truncate">
                        {r.movieTitle || `Movie ID: ${r.movieId}`}
                      </Link>
                      
                      <div className="flex items-center gap-2 flex-shrink-0 bg-gray-50 dark:bg-[#111] px-2 py-0.5 rounded border border-gray-200 dark:border-[#333]">
                        <span className="text-green-600 dark:text-green-500 text-xs font-bold flex items-center gap-1">↑ {r.likes || 0}</span>
                        <span className="text-red-600 dark:text-red-500 text-xs font-bold flex items-center gap-1">↓ {r.dislikes || 0}</span>
                      </div>
                    </div>
                    <p className="text-gray-500 dark:text-[#8c8c8c] text-[10px] mb-1.5 uppercase tracking-wider transition-colors">
                      {new Date(r.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 dark:text-[#ccc] text-sm leading-relaxed line-clamp-3 transition-colors">{r.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};