import React, { useState } from 'react';
import type { User, Gender } from '../../types/User';
import { useAppDispatch } from '../../store/hooks';
import { login, setGuestMode } from '../../store/authSlice';
import { useTranslation } from "react-i18next";

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [error, setError] = useState('');

  // Стейт форми
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<Gender>('Male');
  const [avatar, setAvatar] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usersDB: User[] = JSON.parse(localStorage.getItem('cinema_users_db') || '[]');

    if (mode === 'REGISTER') {
      if (usersDB.find(u => u.email === email)) {
        return setError('Користувач з такою поштою вже існує!');
      }
      
      const newUser: User = {
        id: crypto.randomUUID(),
        username,
        email,
        password, 
        age: Number(age),
        avatar: avatar || `https://ui-avatars.com/api/?name=${username}&background=e50914&color=fff`,
        gender,
      };

      usersDB.push(newUser);
      localStorage.setItem('cinema_users_db', JSON.stringify(usersDB));
      
      dispatch(login(newUser));
      onClose();

    } else {
      const user = usersDB.find(u => u.email === email && u.password === password);
      if (!user) {
        return setError('Невірний email або пароль!');
      }
      
      dispatch(login(user));
      onClose();
    }
  };

  const handleGuest = () => {
    dispatch(setGuestMode());
    onClose();
  };

  const inputBaseClass = "w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm outline-none transition-colors focus:border-[#e50914] dark:focus:border-[#e50914] placeholder:text-gray-400 dark:placeholder:text-gray-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] w-full max-w-md rounded-2xl p-8 shadow-2xl relative transition-colors duration-300">
        
        <div className="text-center mb-8">
          <img src="/images/Logo.png" alt="Logo" className="h-8 mx-auto mb-4 invert dark:invert-0 transition-all duration-300" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {mode === 'LOGIN' ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-600/10 border border-red-200 dark:border-red-600/50 text-red-600 dark:text-red-500 text-sm p-3 rounded-lg mb-4 text-center transition-colors">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'REGISTER' && (
            <>
              <input required type="text" placeholder={t('auth.username')} value={username} onChange={e => setUsername(e.target.value)} className={inputBaseClass} />
              <div className="flex gap-4">
                <input required type="number" min="1" placeholder={t('auth.age')} value={age} onChange={e => setAge(Number(e.target.value))} className={`${inputBaseClass} w-1/3`} />
                <select value={gender} onChange={e => setGender(e.target.value as Gender)} className={`${inputBaseClass} w-2/3 cursor-pointer appearance-none`}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <input type="url" placeholder={t('auth.avatar')} value={avatar} onChange={e => setAvatar(e.target.value)} className={inputBaseClass} />
            </>
          )}

          <input required type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} className={inputBaseClass} />
          <input required type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} className={inputBaseClass} />

          <button type="submit" className="w-full bg-[#e50914] text-white font-bold py-3 rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30 dark:shadow-[0_0_15px_rgba(229,9,20,0.3)] mt-2">
            {mode === 'LOGIN' ? t('auth.login') : t('auth.signup')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors">
          {mode === 'LOGIN' ? (
            <p>{t('auth.newToCinema')} <button onClick={() => { setMode('REGISTER'); setError(''); }} className="text-gray-900 dark:text-white hover:text-[#e50914] dark:hover:text-[#e50914] font-medium transition-colors">{t('auth.signup')} now</button></p>
          ) : (
            <p>{t('auth.alreadyHave')} <button onClick={() => { setMode('LOGIN'); setError(''); }} className="text-gray-900 dark:text-white hover:text-[#e50914] dark:hover:text-[#e50914] font-medium transition-colors">{t('auth.login')}</button></p>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-[#2a2a2a] text-center transition-colors">
          <button onClick={handleGuest} className="text-gray-500 hover:text-gray-900 dark:text-[#8c8c8c] dark:hover:text-white text-sm font-medium transition-colors">
            {t('auth.continueGuest')}
          </button>
        </div>

      </div>
    </div>
  );
};
