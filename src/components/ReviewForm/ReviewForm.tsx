/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import api from "../../api/axios";

interface ReviewFormProps {
  movieId: string;
  movieTitle: string;
  moviePoster: string; 
  user: any;
  onReviewPublished: (newReview: any) => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ 
  movieId, 
  movieTitle, 
  moviePoster, 
  user, 
  onReviewPublished 
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(10);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (text.trim().length < 10) {
      setError(t('movieDetails.reviewTooShort') || "Minimum 10 characters required.");
      return;
    }

    try {
      // 1. Надсилаємо запит
      const response = await api.post('/reviews', {
        movie_id: Number(movieId),
        movie_title: movieTitle,
        content: text.trim(),
        rating: rating,
        movie_poster: moviePoster,
        user_avatar: user.avatar
      });

      // 2. Обробка відповіді: 
      // Бекенд на Supabase повертає об'єкт або масив об'єктів. 
      // Якщо повертається масив, беремо перший елемент.
      const savedData = Array.isArray(response.data) ? response.data[0] : response.data;

      // 3. Формуємо об'єкт так, як його чекає MovieReviews (схема GET /api/reviews)
      // Це "залатає" дірку з "UN" та порожнім контентом
      const newRev = {
        ...savedData,
        // Обов'язково додаємо ці поля в корінь, бо твій бекенд FlattenedData їх там чекає
        username: user.username,
        avatar: user.avatar,
        // Також дублюємо в profiles для сумісності з іншими компонентами
        profiles: {
          username: user.username,
          avatar: user.avatar
        },
        movie_poster: moviePoster,
        created_at: savedData.created_at || new Date().toISOString()
      };

      // 4. Повідомляємо батьківський компонент
      onReviewPublished(newRev);
      
      // Скидаємо форму
      setText("");
      setRating(10);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error posting review");
      console.error("Review deploy failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-16 group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-[#e50914] to-orange-900 rounded-[2rem] blur opacity-5 group-hover:opacity-15 transition duration-1000"></div>
      
      <div className="relative bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/5 p-8 rounded-[2rem] shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Автор */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative">
                <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#e50914] shadow-lg shadow-red-600/10" 
                    alt="avatar" 
                />
                <div className="absolute -bottom-2 -right-2 bg-[#e50914] text-white text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                    {user.rank || 'CIVILIAN'}
                </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
               <h4 className="text-gray-900 dark:text-white font-black uppercase tracking-widest italic text-lg">
                 Leave a Mark
               </h4>
               
               <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#0a0a0a] px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-white/5 shadow-inner">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
                  <div className="flex items-center gap-3">
                     <input 
                        type="range" min="1" max="10" step="1" 
                        value={rating} 
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-24 h-1 bg-gray-300 dark:bg-[#222] rounded-lg appearance-none cursor-pointer accent-[#e50914]"
                     />
                     <span className="text-[#e50914] font-black text-xl w-6 text-center tabular-nums">{rating}</span>
                  </div>
               </div>
            </div>

            <textarea 
              value={text} 
              onChange={(e) => { setText(e.target.value); setError(""); }}
              placeholder={`What's your assessment of "${movieTitle}"?`}
              className="w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl p-6 text-gray-900 dark:text-white text-sm outline-none focus:border-[#e50914]/50 min-h-[160px] transition-all placeholder:text-gray-500 placeholder:italic leading-relaxed resize-none"
            />
            
            <div className="flex justify-between items-center mt-6">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
                {text.length} characters
              </span>
              <button 
                type="submit" 
                className="px-10 py-3 bg-[#e50914] text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-red-600/20"
              >
                Deploy Review
              </button>
            </div>
            {error && <p className="text-[#e50914] text-[10px] mt-4 font-black uppercase tracking-widest animate-pulse">{error}</p>}
          </div>
        </div>
      </div>
    </form>
  );
};