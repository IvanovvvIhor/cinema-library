import React, { useState } from "react";
import { Link } from "react-router-dom";
import type { Movie } from "../../types/Movie";
import { useAppSelector } from "../../store/hooks";
import { AddToListPopover } from "../AddToListPopover/AddToListPopover";

// #region Інтерфейси
interface MovieCardProps {
  movie: Movie;
  isSelectionMode?: boolean; // Чи активовано режим масового виділення
  isSelected?: boolean;      // Чи вибрана ця конкретна картка
  onToggleSelection?: (id: number) => void; // Функція для перемикання стану вибору
}
// #endregion

export const MovieCard: React.FC<MovieCardProps> = ({ 
  movie, 
  isSelectionMode, 
  isSelected, 
  onToggleSelection 
}) => {
  // #region Стейт та Селектори
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  // #endregion

  // #region Обробники подій (Handlers)
  const handleCardClick = (e: React.MouseEvent) => {
    // Якщо режим вибору активний, замість переходу по лінку перемикаємо чекбокс
    if (isSelectionMode && onToggleSelection) {
      e.preventDefault(); 
      onToggleSelection(movie.id);
    }
  };
  // #endregion

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-white dark:bg-[#1a1a1a] border rounded-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer
        ${isSelectionMode && isSelected 
          ? "border-[#e50914] ring-2 ring-[#e50914]/20 shadow-lg" 
          : "border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#444] hover:shadow-lg"
        }`}
    >
      
      {/* Елемент вибору (Чекбокс) - видимий лише в режимі вибору */}
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

      {/* Швидке додавання у списки - приховано в режимі вибору */}
      {user && !isSelectionMode && (
        <div className="absolute top-2 left-2 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPopoverOpen(!isPopoverOpen);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isPopoverOpen 
                ? 'bg-[#e50914] text-white' 
                : 'bg-black/60 text-white opacity-0 group-hover:opacity-100 backdrop-blur-md hover:bg-[#e50914]'
            }`}
          >
            <svg className={`w-4 h-4 transition-transform ${isPopoverOpen ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {isPopoverOpen && (
            <AddToListPopover movie={movie} onClose={() => setIsPopoverOpen(false)} />
          )}
        </div>
      )}

      {/* Основний контент картки */}
      <Link 
        to={isSelectionMode ? "#" : `/movie/${movie.id}`} 
        className="flex flex-col h-full rounded-xl overflow-hidden"
      >
        {/* Постер фільму */}
        <div className="relative w-full aspect-[2/3] bg-gray-100 dark:bg-[#111]">
          {movie.posterUrl ? (
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              className={`w-full h-full object-cover transition-all duration-500 ${isSelected ? 'opacity-60 scale-95' : 'group-hover:scale-105'}`} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-[#333] text-sm font-medium">No Image</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Рейтинг фільму */}
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5 z-10">
            <svg className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-white text-[11px] font-bold">{movie.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Текстова інформація */}
        <div className="p-3 flex flex-col gap-0.5 flex-1 z-10 bg-white dark:bg-[#1a1a1a] transition-colors duration-300">
          <h3 className="text-gray-900 dark:text-white text-[13px] font-semibold leading-tight line-clamp-1 group-hover:text-[#e50914] transition-colors duration-200">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-gray-500 dark:text-[#8c8c8c] text-[11px]">{movie.year}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-[#333]" />
            <span className="text-gray-500 dark:text-[#8c8c8c] text-[11px] truncate">{movie.genre}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};