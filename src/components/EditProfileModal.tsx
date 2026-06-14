/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/authSlice';
import type { Gender } from '../types/User';
import api from "../api/axios";
import { useTranslation } from "react-i18next";

interface EditProfileModalProps {
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const [username, setUsername] = useState(user?.username || '');
  const [age, setAge] = useState<number | ''>(user?.age || '');
  const [gender, setGender] = useState<Gender>(user?.gender || 'Male');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [error, setError] = useState('');

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (Number(age) <= 0 || Number(age) > 120) {
      return setError(t('editProfile.ageError', 'Please enter a valid age (1-120)'));
    }

    try {
      const response = await api.put('/profile', {
        username,
        age: Number(age),
        gender,
        avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=e50914&color=fff`
      });

      dispatch(setCredentials({ user: response.data.user }));
      onClose();
    } catch (err: any) {
      const serverError = err.response?.data?.error || t('editProfile.updateError', 'Failed to update profile');
      setError(serverError);
    }
  };

  const inputBaseClass = `
    w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] 
    rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm outline-none transition-colors 
    focus:border-[#e50914] dark:focus:border-[#e50914] placeholder:text-gray-400 dark:placeholder:text-gray-500
    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] w-full max-w-md rounded-2xl p-8 shadow-2xl relative transition-colors duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 dark:text-[#8c8c8c] hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('editProfile.title', 'Edit Profile')}</h2>
          <p className="text-gray-500 dark:text-[#8c8c8c] text-sm mt-1">{t('editProfile.subtitle', 'Update your personal information')}</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/50 text-red-600 dark:text-red-500 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1">{t('editProfile.username', 'Username')}</label>
            <input required type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputBaseClass} />
          </div>

          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1">{t('editProfile.age', 'Age')}</label>
              <input 
                required 
                type="number" 
                placeholder={t('editProfile.age', 'Age')}
                value={age} 
                onChange={e => {
                    const val = e.target.value;
                    if (val.length <= 3) setAge(val === '' ? '' : Number(val));
                }} 
                className={inputBaseClass} 
              />
            </div>
            <div className="w-2/3">
              <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1">{t('editProfile.gender', 'Gender')}</label>
              <select 
                value={gender} 
                onChange={e => setGender(e.target.value as Gender)} 
                className={`${inputBaseClass} appearance-none cursor-pointer`}
              >
                <option value="Male">{t('gender.male', 'Male')}</option>
                <option value="Female">{t('gender.female', 'Female')}</option>
                <option value="Other">{t('gender.other', 'Other')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1">{t('editProfile.avatarUrl', 'Avatar URL')}</label>
            <input 
              type="url" 
              placeholder="https://..." 
              value={avatar} 
              onChange={e => setAvatar(e.target.value)} 
              className={inputBaseClass} 
            />
          </div>

          <div>
            <label className="block text-gray-600 dark:text-[#8c8c8c] text-xs font-medium mb-1 pl-1">{t('editProfile.emailReadOnly', 'Email (Read Only)')}</label>
            <input 
              disabled 
              type="email" 
              value={user.email} 
              className="w-full bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-400 dark:text-[#666] text-sm cursor-not-allowed" 
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="w-1/2 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-[#222] transition-colors"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button 
              type="submit" 
              className="w-1/2 bg-[#e50914] text-white font-bold py-3 rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30 dark:shadow-[0_0_15px_rgba(229,9,20,0.3)]"
            >
              {t('common.saveChanges', 'Save Changes')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};