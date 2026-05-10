/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createNewList } from '../../store/watchlistSlice';
import type { ListVisibility } from '../../types/Watchlist';

// #region Інтерфейси
interface CreateListModalProps {
  onClose: () => void;
}
// #endregion

export const CreateListModal: React.FC<CreateListModalProps> = ({ onClose }) => {
  // #region Хуки та Redux Диспетчер
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  // #endregion

  // #region Локальний Стейт: Дані нового списку
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [visibility, setVisibility] = useState<ListVisibility>('Private');
  // #endregion

  // #region Обробники подій (Handlers)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    // Створення нового списку через Redux Slice
    dispatch(createNewList({
      ownerId: user.id,
      title: title.trim(),
      description: description.trim(),
      coverUrl: coverUrl.trim() || undefined, 
      visibility
    }));

    onClose();
  };
  // #endregion

  // #region Стилізовані константи (Tailwind Classes)
  const inputClass = "w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm outline-none transition-colors focus:border-[#e50914] dark:focus:border-[#e50914] placeholder:text-gray-400 dark:placeholder:text-gray-600";
  // #endregion

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] w-full max-w-md rounded-2xl p-8 shadow-2xl relative transition-colors duration-300">
        
        {/* Кнопка закриття */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 dark:text-[#8c8c8c] hover:text-gray-900 dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Заголовок модального вікна */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Create New List</h2>
          <p className="text-gray-500 dark:text-[#8c8c8c] text-sm mt-1 transition-colors">Organize your movies into collections</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Поле: Назва списку */}
          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-bold uppercase tracking-wider mb-1.5 pl-1">List Title</label>
            <input 
              required 
              type="text" 
              placeholder="e.g., Weekend Classics"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className={inputClass} 
            />
          </div>

          {/* Поле: URL Обкладинки */}
          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-bold uppercase tracking-wider mb-1.5 pl-1">Cover Image URL (Optional)</label>
            <input 
              type="url" 
              placeholder="https://images.com/my-cover.jpg"
              value={coverUrl} 
              onChange={e => setCoverUrl(e.target.value)} 
              className={inputClass} 
            />
          </div>

          {/* Поле: Опис */}
          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-bold uppercase tracking-wider mb-1.5 pl-1">Description (Optional)</label>
            <textarea 
              rows={2}
              placeholder="What is this list about?"
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              className={`${inputClass} resize-none`} 
            />
          </div>

          {/* Поле: Приватність (Видимість) */}
          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-bold uppercase tracking-wider mb-1.5 pl-1">Visibility</label>
            <select 
              value={visibility} 
              onChange={e => setVisibility(e.target.value as ListVisibility)} 
              className={`${inputClass} appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat`}
            >
              <option value="Private">🔒 Private (Only you)</option>
              <option value="Public">🌍 Public (Shared with community)</option>
            </select>
          </div>

          {/* Кнопки керування */}
          <div className="flex gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="w-1/2 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-[#222] transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="w-1/2 bg-[#e50914] text-white font-bold py-3 rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30 dark:shadow-[0_0_15px_rgba(229,9,20,0.3)]"
            >
              Create List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};