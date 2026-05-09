import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateUserProfile } from '../../store/authSlice';
import type { Gender } from '../../types/User';

interface EditProfileModalProps {
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [username, setUsername] = useState(user?.username || '');
  const [age, setAge] = useState<number | ''>(user?.age || '');
  const [gender, setGender] = useState<Gender>(user?.gender || 'Male');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(updateUserProfile({
      username,
      age: Number(age),
      gender,
      avatar,
    }));

    onClose();
  };

  // Базовий клас для інпутів, як в AuthModal
  const inputBaseClass = "w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm outline-none transition-colors focus:border-[#e50914] dark:focus:border-[#e50914] placeholder:text-gray-400 dark:placeholder:text-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] w-full max-w-md rounded-2xl p-8 shadow-2xl relative transition-colors duration-300">
        
        {/* Кнопка закриття (Хрестик) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-[#8c8c8c] hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Edit Profile</h2>
          <p className="text-gray-500 dark:text-[#8c8c8c] text-sm mt-1 transition-colors duration-300">Update your personal information</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1 transition-colors duration-300">Username</label>
            <input 
              required 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className={inputBaseClass} 
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1 transition-colors duration-300">Age</label>
              <input 
                required 
                type="number" 
                min="1" 
                value={age} 
                onChange={e => setAge(Number(e.target.value))} 
                className={inputBaseClass} 
              />
            </div>
            <div className="w-2/3">
              <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1 transition-colors duration-300">Gender</label>
              <select 
                value={gender} 
                onChange={e => setGender(e.target.value as Gender)} 
                className={`${inputBaseClass} appearance-none cursor-pointer`}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1 transition-colors duration-300">Avatar URL</label>
            <input 
              type="url" 
              placeholder="https://..." 
              value={avatar} 
              onChange={e => setAvatar(e.target.value)} 
              className={inputBaseClass} 
            />
            {!avatar && (
              <p className="text-[10px] text-gray-400 dark:text-[#666] mt-1 pl-1 transition-colors duration-300">Leave empty to use a generated avatar.</p>
            )}
          </div>

          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1 transition-colors duration-300">Email (Read Only)</label>
            <input 
              disabled 
              type="email" 
              value={user.email} 
              className="w-full bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-400 dark:text-[#666] text-sm cursor-not-allowed transition-colors duration-300" 
            />
          </div>

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
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};