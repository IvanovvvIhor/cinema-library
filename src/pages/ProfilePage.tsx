/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logout, setCredentials } from "../store/authSlice"; 
import { AuthModal } from "../components/AuthModal/AuthModal";
import { EditProfileModal } from "../components/EditProfileModal/EditProfileModal";
import { useTranslation } from "react-i18next";
import api from "../api/axios";

export const ProfilePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { user, isGuest } = useAppSelector((state) => state.auth);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [_isLoading, setIsLoading] = useState(true);

  const [isAchExpanded, setIsAchExpanded] = useState(false);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

    const loadProfileData = async () => {
        if (!user) return;
        try {
        setIsLoading(true);
        const profileRes = await api.get('/profile', getAuthHeaders()); 
        if (profileRes.data) {
            dispatch(setCredentials({ user: profileRes.data })); 
        }

        const [reviewsRes, achRes] = await Promise.all([
            api.get('/reviews', getAuthHeaders()),
            api.get('/achievements', getAuthHeaders())
        ]);
        
        const myReviews = reviewsRes.data.filter((r: any) => 
            String(r.user_id).trim() === String(user.id).trim()
        );
        
        setUserReviews(myReviews);
        setAchievements(achRes.data);
        } catch (err) {
        console.error("Sync error:", err);
        } finally {
        setIsLoading(false);
        }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/');
  };


  if (!user || isGuest) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#0a0a0a] items-center justify-center">
        <AuthModal onClose={() => navigate('/catalog')} />
      </div>
    );
  }

  const xpPerLevel = 500;
  const currentXP = user.xp || 0;
  const currentLevelProgress = currentXP % xpPerLevel;
  const progressPercent = Math.min((currentLevelProgress / xpPerLevel) * 100, 100);
  const initials = user.username.substring(0, 2).toUpperCase();

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#0a0a0a] overflow-y-auto transition-colors duration-300 pb-20 md:pb-0">
      {isEditModalOpen && <EditProfileModal onClose={() => setIsEditModalOpen(false)} />}

      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
        <h1 className="text-gray-900 dark:text-white text-lg font-black uppercase italic tracking-tighter">{t('profile.title')}</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/analytics')} 
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-xs font-black uppercase rounded-xl border border-gray-200 dark:border-white/10 hover:text-[#e50914] hover:border-[#e50914]/40 transition-all"
          >
            Детальна аналітика
          </button>
          <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-xs font-black uppercase rounded-xl border border-gray-200 dark:border-white/10 hover:text-[#e50914] transition-all">
            {t('profile.editProfile')}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600/10 text-red-600 text-xs font-black uppercase rounded-xl border border-red-600/20">
            {t('profile.logout')}
          </button>
        </div>
      </header>

      <div className="px-4 md:px-8 py-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">

        {/* HERO SECTION - BIOMETRICS WITH LOCALIZATION */}
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-8 bg-white dark:bg-[#111] p-8 rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#e50914] blur-[100px] opacity-10" />
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#e50914] to-yellow-500 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(229,9,20,0.3)]">
              {user.avatar && !user.avatar.includes('ui-avatars') ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" /> : initials}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#e50914] text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-lg">LVL {user.level || 1}</div>
          </div>
          <div className="flex flex-col gap-3 z-10 text-center sm:text-left">
            <div>
              <h2 className="text-gray-900 dark:text-white text-4xl font-black uppercase italic tracking-tighter">{user.username}</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e50914]">{user.rank || 'Civilian'}</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/10">
                {user.age ? `${user.age} Y.O.` : 'AGE UNKNOWN'}
              </span>
              <span className="bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border border-gray-200 dark:border-white/10">
                {user.gender || 'GENDER N/A'}
              </span>
            </div>
          </div>
        </section>

        {/* XP PROGRESS BAR */}
        <section className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-900 dark:text-white text-[11px] font-black uppercase italic tracking-widest">Evolution Progress</span>
            <span className="text-gray-500 text-[10px] font-bold">{currentLevelProgress} / 500 XP</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-black rounded-full overflow-hidden border border-gray-200 dark:border-white/10 p-[2px]">
            <div 
                className="h-full bg-gradient-to-r from-[#e50914] via-[#ff4d4d] to-yellow-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(229,9,20,0.4)]" 
                style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </section>

        {/* ACHIEVEMENTS - INTEGRATED WITH i18next */}
        <section className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <button onClick={() => setIsAchExpanded(!isAchExpanded)} className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all">
            <h3 className="text-gray-900 dark:text-white text-xs font-black uppercase italic tracking-[0.2em]">{t('profile.achievements.title')}</h3>
            <span className={`text-gray-400 transition-transform duration-300 ${isAchExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          <div className={`grid transition-all duration-500 ease-in-out ${isAchExpanded ? 'grid-rows-[1fr] opacity-100 p-8 pt-0' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.length > 0 ? achievements.map((a) => {
                const isEasterEgg = ['cult_classics_secrets', 'directors_easter_eggs', 'masterpieces_group', 'special_conditions'].includes(a.category);
                const isHidden = isEasterEgg && !a.is_unlocked;

                return (
                  <div key={a.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${a.is_unlocked ? "bg-[#e50914]/5 border-[#e50914]/20 shadow-lg shadow-red-900/10" : "bg-gray-50 dark:bg-black/40 border-transparent opacity-40 grayscale"}`}>
                    <span className="text-2xl">{isHidden ? "❓" : a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white text-[11px] font-black uppercase truncate">
                        {isHidden ? t('profile.achievements.classified') : a.name}
                      </p>
                      <p className="text-gray-500 text-[9px] font-bold uppercase tracking-tighter line-clamp-1">
                        {isHidden ? t('profile.achievements.classified_desc') : a.description}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-gray-500 text-[10px] uppercase font-black italic opacity-50 p-4">{t('profile.achievements.no_data')}</p>
              )}
            </div>
          </div>
        </section>

        {/* RECENT REVIEWS - SCROLLABLE */}
        <section className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl mb-12">
          <button onClick={() => setIsReviewsExpanded(!isReviewsExpanded)} className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all">
            <h3 className="text-gray-900 dark:text-white text-xs font-black uppercase italic tracking-[0.2em]">{t('profile.reviewsTitle')}</h3>
            <span className={`text-gray-400 transition-transform duration-300 ${isReviewsExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>

          <div className={`transition-all duration-500 ease-in-out ${isReviewsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-8 pt-0 flex flex-col gap-4 overflow-y-auto max-h-[400px] custom-scrollbar">
              {userReviews.length === 0 ? (
                <p className="text-gray-600 text-center py-10 uppercase text-[10px] font-black italic opacity-40">No debriefings recorded in this sector.</p>
              ) : (
                userReviews.map((r) => (
                  <div key={r.id} className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 p-5 rounded-3xl flex gap-5 hover:border-[#e50914]/40 transition-all group">
                    <div className="w-12 h-16 bg-gray-200 dark:bg-[#222] rounded-xl flex-shrink-0 overflow-hidden border border-white/5 group-hover:scale-105 transition-transform duration-300">
                      {r.movie_poster && <img src={r.movie_poster} alt="poster" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <Link to={`/movie/${r.movie_id}`} className="text-gray-900 dark:text-white text-xs font-black uppercase hover:text-[#e50914] truncate tracking-tight">{r.movie_title || 'Asset'}</Link>
                        <span className="text-[#e50914] text-[10px] font-black italic bg-[#e50914]/10 px-2 py-0.5 rounded">⭐ {r.rating}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-[10px] italic leading-relaxed line-clamp-3">"{r.content || r.text}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};