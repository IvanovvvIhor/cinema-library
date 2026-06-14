/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

interface MovieReviewsProps {
  reviews: any[];
  currentUser: any;
  onDelete: (id: string) => void;
}

export const MovieReviews: React.FC<MovieReviewsProps> = ({ reviews, currentUser, onDelete }) => {
  
  // Тепер функція просто передає ID нагору без жодних системних вікон
  const handleDeleteClick = (id: string) => {
    onDelete(id);
  };

  if (reviews.length === 0) {
    return (
        <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[3rem]">
            <p className="text-gray-400 italic text-sm tracking-widest uppercase font-bold opacity-30">Zero data found in this sector.</p>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {reviews.map((rev) => (
        <div key={rev.id} className="relative group">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-8 transition-all hover:bg-gray-50 dark:hover:bg-[#141414] hover:translate-x-2 shadow-sm">
            
            {/* Ліва частина: Аватар + Рейтинг */}
            <div className="flex md:flex-col items-center gap-4 md:w-20 shrink-0">
              <img 
                src={rev.profiles?.avatar || `https://ui-avatars.com/api/?name=${rev.profiles?.username}`} 
                className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                alt="author" 
              />
              <div className="flex flex-col items-center leading-none">
                <span className="text-[#e50914] font-black text-2xl italic tracking-tighter">{rev.rating}</span>
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Score</span>
              </div>
            </div>

            {/* Права частина: Текст */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-gray-900 dark:text-white font-black uppercase tracking-tight text-lg">{rev.profiles?.username}</h4>
                  <span className="text-gray-400 dark:text-[#444] text-[9px] font-bold uppercase tracking-[0.2em]">
                    Timestamp: {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Кнопка видалення */}
                {currentUser?.id === rev.user_id && (
                  <button 
                    onClick={() => handleDeleteClick(rev.id)} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-gray-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-wrap italic font-medium">
                "{rev.content}"
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};