import React from "react";
import { Link } from "react-router-dom";
import type { Movie } from "../../types/Movie";

// #region Інтерфейси
interface MovieCardProps {
  movie: Movie;
  isSelectionMode?: boolean; 
  isSelected?: boolean;      
  onToggleSelection?: (id: number) => void; 
}
// #endregion

export const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  isSelectionMode, 
  isSelected, 
  onToggleSelection 
}) => {

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSelectionMode && onToggleSelection) {
      e.preventDefault(); 
      onToggleSelection(movie.id);
    }
  };

  const movieLink = `/movie/${movie.id}`;

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-white dark:bg-[#1a1a1a] border rounded-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer
        ${isSelectionMode && isSelected 
          ? "border-[#e50914] ring-2 ring-[#e50914]/20 shadow-lg" 
          : "border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#444] hover:shadow-lg"
        }`}
    >
      
      {/* Чекбокс для масового вибору (залишаємо логіку, якщо isSelectionMode колись знадобиться) */}
      {isSelectionMode && (
        <div className="absolute top-3 left-3 z-30">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected 
              ? "bg-[#e50914] border-[#e50914]" 
              : "bg-black/40 border-white backdrop-blur-md"
          }`}>
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* КНОПКУ ШВИДКОГО ДОДАВАННЯ ВИДАЛЕНО ЗГІДНО З ПРОТОКОЛОМ */}

      <Link 
        to={isSelectionMode ? "#" : movieLink} 
        className="flex flex-col h-full rounded-xl overflow-hidden"
      >
        <div className="relative w-full aspect-[2/3] bg-gray-100 dark:bg-[#111]">
          {movie.posterUrl ? (
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? 'opacity-60 scale-95' : 'group-hover:scale-105'}`} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-[#333] text-[10px] font-black uppercase italic">No Visuals</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 z-10">
            <svg className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-white text-[10px] font-black italic">{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="p-3 flex flex-col gap-0.5 flex-1 z-10 bg-white dark:bg-[#1a1a1a]">
          <h3 className="text-gray-900 dark:text-white text-[13px] font-black uppercase italic tracking-tight line-clamp-1 group-hover:text-[#e50914] transition-colors duration-200">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-gray-500 dark:text-[#555] text-[10px] font-bold">{movie.year}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-[#333]" />
            <span className="text-gray-500 dark:text-[#555] text-[10px] font-bold truncate">
               {Array.isArray(movie.genre) ? movie.genre[0] : movie.genre}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};