/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import type { Gender } from '../../types/User';
import { useAppDispatch } from '../../store/hooks';
import { login, setGuestMode } from '../../store/authSlice';
import { useTranslation } from "react-i18next";
import api from "../../api/axios";
import Logo from '/images/Logo.svg';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Male');
  const [avatar, setAvatar] = useState('');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'uk' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|icloud\.com)$/i;
    if (!emailRegex.test(email.trim())) {
      return setError(t('auth.errorEmailProvider') || 'Only Gmail and iCloud addresses are allowed');
    }
    if (password.length < 6) {
      return setError(t('auth.errorPasswordShort') || 'Password must be at least 6 characters');
    }
    if (mode === 'REGISTER') {
      if (username.trim().length < 3 || username.length > 20) {
        return setError(t('auth.errorUsernameLength') || 'Username must be between 3 and 20 characters');
      }
      if (Number(age) <= 0 || Number(age) > 120) {
        return setError(t('auth.errorInvalidAge') || 'Please enter a valid age (1-120)');
      }
    }

    try {
      if (mode === 'REGISTER') {
        const response = await api.post('register', {
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          age: Number(age),
          gender,
          avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=e50914&color=fff`
        });
        localStorage.setItem('token', response.data.token);
        dispatch(login(response.data.user));
        onClose();
      } else {
        const response = await api.post('login', { 
          email: email.trim().toLowerCase(), 
          password 
        });
        localStorage.setItem('token', response.data.token);
        dispatch(login(response.data.user));
        onClose();
      }
    } catch (err: any) {
      const serverError = err.response?.data?.error || t('auth.errorInvalid');
      setError(serverError);
    }
  };

  const handleGuest = () => {
    dispatch(setGuestMode());
    onClose();
  };

  const inputBaseClass = `w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm outline-none transition-colors focus:border-[#e50914] dark:focus:border-[#e50914] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] w-full max-w-md rounded-2xl p-8 shadow-2xl relative transition-colors duration-300">
        <button onClick={toggleLanguage} className="absolute top-4 right-4 px-2 py-1 bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-lg text-[10px] font-black uppercase tracking-tighter text-gray-600 dark:text-gray-400 hover:text-[#e50914] transition-colors">
          {i18n.language === 'en' ? 'UA' : 'EN'}
        </button>

        <div className="text-center mb-8">
          <img src={Logo} alt="Logo" className="h-8 mx-auto mb-4 invert dark:invert-0" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'LOGIN' ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-600/10 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'REGISTER' && (
            <>
              <input required type="text" placeholder={t('auth.username')} value={username} onChange={e => setUsername(e.target.value)} className={inputBaseClass} />
              <div className="flex gap-4">
                <input required type="number" placeholder={t('auth.age')} value={age} onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))} className={`${inputBaseClass} w-1/3`} />
                <select value={gender} onChange={e => setGender(e.target.value as Gender)} className={`${inputBaseClass} w-2/3 cursor-pointer appearance-none`}>
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </div>
              <input type="url" placeholder={t('auth.avatar')} value={avatar} onChange={e => setAvatar(e.target.value)} className={inputBaseClass} />
            </>
          )}
          <input required type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} className={inputBaseClass} />
          <input required type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} className={inputBaseClass} />
          <button type="submit" className="w-full bg-[#e50914] text-white font-bold py-3 rounded-xl hover:bg-red-600 transition mt-2">
            {mode === 'LOGIN' ? t('auth.login') : t('auth.signup')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === 'LOGIN' ? <p>{t('auth.newToCinema')} <button type="button" onClick={() => setMode('REGISTER')} className="text-white hover:text-[#e50914]">{t('auth.signup')}</button></p> : <p>{t('auth.alreadyHave')} <button type="button" onClick={() => setMode('LOGIN')} className="text-white hover:text-[#e50914]">{t('auth.login')}</button></p>}
        </div>

        {/* ПОВЕРНУЛИ КНОПКУ GUEST */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2a2a2a] text-center">
            <button type="button" onClick={handleGuest} className="text-gray-500 hover:text-gray-900 dark:text-[#8c8c8c] dark:hover:text-white text-sm font-medium transition-colors">
                {t('auth.continueGuest')}
            </button>
        </div>
      </div>
    </div>
  );
};