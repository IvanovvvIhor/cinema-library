/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAppSelector } from '../store/hooks';
import api from '../api/axios';
import type { Movie } from '../types/Movie';

interface AddToListPopoverProps {
  movie: Movie; // Тепер тільки один об'єкт, ніяких масивів
  onClose: () => void;
  anchorRect?: DOMRect;
}

export const AddToListPopover: React.FC<AddToListPopoverProps> = ({ 
  movie, 
  onClose, 
  anchorRect 
}) => {
  const user = useAppSelector((state) => state.auth.user);
  const [lists, setLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const loadLists = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const res = await api.get('/lists');
        
        // Фільтруємо лише власні активи (завжди String для надійності)
        const myOwn = res.data.filter((l: any) => String(l.user_id) === String(user.id));
        setLists(myOwn);
      } catch (err) {
        console.error("Critical Sync Failure in Popover:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLists();
  }, [user?.id]);

  const handleAdd = async (listId: number) => {
    setActionLoading(listId);
    try {
      // Пряма передача даних у базу через наш оновлений ендпоїнт
      await api.post(`/lists/${listId}/items`, {
        movie_id: movie.id,
        movie_title: movie.title,
        poster_path: movie.posterUrl,
        rating: movie.rating || 0,
        runtime: movie.runtime || 0 // Тепер runtime залітає коректно
      });
      onClose();
    } catch (err) {
      console.error("Strategic assignment failure:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // Розрахунок позиції (для Portal або для вбудованого режиму)
  const popoverStyle: React.CSSProperties = anchorRect ? {
    position: 'fixed',
    top: `${anchorRect.bottom + window.scrollY + 8}px`,
    left: `${anchorRect.left + window.scrollX}px`,
  } : {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    marginBottom: '8px'
  };

  const content = (
    <div 
      style={popoverStyle}
      className="w-56 bg-[#0d0d0d] border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[9999] py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-5 pb-2 border-b border-white/5 mb-1">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e50914] italic">
          Assign Sector
        </p>
        <div className="flex justify-between items-center mt-0.5">
            <span className="text-[8px] font-bold text-gray-500 uppercase truncate max-w-[100px]">
                {movie.title}
            </span>
            <span className="text-[#e50914] text-[9px] font-black italic">
                ⭐ {movie.rating?.toFixed(1)}
            </span>
        </div>
      </div>
      
      <div className="flex flex-col max-h-56 overflow-y-auto no-scrollbar">
        {isLoading ? (
          <div className="py-6 flex justify-center">
            <div className="w-4 h-4 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : lists.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-[9px] font-bold text-gray-600 uppercase italic">No active sectors</p>
          </div>
        ) : (
          lists.map((list) => (
            <button
              key={list.id}
              disabled={actionLoading !== null}
              onClick={() => handleAdd(list.id)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-all text-left group"
            >
              <span className="text-[11px] font-black uppercase text-gray-300 group-hover:text-white truncate">
                {list.name}
              </span>
              {actionLoading === list.id ? (
                <div className="w-3 h-3 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-[#e50914] opacity-0 group-hover:opacity-100 shadow-[0_0_8px_#e50914] transition-all" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return anchorRect ? ReactDOM.createPortal(content, document.body) : content;
};