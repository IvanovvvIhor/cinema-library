import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setTheme } from "../store/themeSlice";
import { updateUserProfile } from "../store/authSlice";
import { useTranslation } from "react-i18next"; 
import { Link } from "react-router-dom";

export const SettingsPage: React.FC = () => {
  // #region Хуки та Redux Диспетчер
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  // #endregion

  // #region Селектори Redux
  const { user, isGuest } = useAppSelector((state) => state.auth);
  const themeMode = useAppSelector((state) => state.theme.mode);
  // #endregion

  // #region Локальний Стейт: Редагування профілю (лише якщо є user)
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  // #endregion

  // #region Обробники подій
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      dispatch(updateUserProfile({ 
        ...user, 
        username, 
        email, 
        avatar 
      }));
      alert(t('settings.profileUpdated') || "Profile updated successfully!"); 
    }
  };

  const handleChangeAvatar = () => {
    const newAvatarUrl = window.prompt(t('settings.enterAvatarUrl') || "Enter new avatar URL:", avatar);
    if (newAvatarUrl !== null) {
      setAvatar(newAvatarUrl.trim());
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  // #endregion

  // #region Дані для FAQ
  const faqs = [
    { q: t('settings.faq1_q'), a: t('settings.faq1_a') },
    { q: t('settings.faq2_q'), a: t('settings.faq2_a') },
    { q: t('settings.faq3_q'), a: t('settings.faq3_a') },
    { q: t('settings.faq4_q'), a: t('settings.faq4_a') }
  ];
  // #endregion

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111] overflow-y-auto transition-colors duration-300 pb-20 md:pb-0">
      
      {/* HEADER SECTION - Адаптований */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#222] px-4 md:px-8 py-6">
        <h1 className="text-gray-900 dark:text-white text-xl md:text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-gray-500 dark:text-[#8c8c8c] text-xs md:text-sm mt-1">{t('settings.description')}</p>
      </header>

      <div className="px-4 md:px-8 py-8 flex flex-col gap-10 max-w-4xl mx-auto w-full">
        
        {/* 1. PROFILE EDIT SECTION - Умовний рендеринг */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('settings.profileInfo')}</h2>
          
          {!user || isGuest ? (
            /* ЗАГЛУШКА ДЛЯ ГОСТЯ */
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-colors">
              <span className="text-2xl">👤</span>
              <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">
                {t('settings.loginRequired', 'Log in to your account to edit your profile and save personal data.')}
              </p>
              <Link to="/" className="text-[#e50914] text-xs font-bold uppercase tracking-widest hover:underline mt-1">
                {t('auth.login')} / {t('auth.signup')}
              </Link>
            </div>
          ) : (
            /* ФОРМА ДЛЯ АВТОРИЗОВАНОГО */
            <form onSubmit={handleProfileSave} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-4 md:p-6 flex flex-col gap-5 shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-gray-100 dark:border-[#222]">
                {avatar && !avatar.includes('ui-avatars') ? (
                  <img src={avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-[#2a2a2a]" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e50914] to-orange-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                    {username.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex flex-col items-center sm:items-start gap-2">
                  <button type="button" onClick={handleChangeAvatar} className="px-4 py-2 bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-xs font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] transition-colors">
                    {t('settings.changeAvatar')}
                  </button>
                  {avatar && (
                    <button type="button" onClick={() => setAvatar("")} className="text-red-600 dark:text-[#e50914] text-[10px] font-bold uppercase hover:underline">
                      {t('settings.removeAvatar')}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-[#666] uppercase tracking-widest ml-1">{t('settings.username')}</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm outline-none focus:border-[#e50914] transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-[#666] uppercase tracking-widest ml-1">{t('settings.email')}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-4 py-2.5 text-gray-900 dark:text-white text-sm outline-none focus:border-[#e50914] transition-colors" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="w-full sm:w-auto px-8 py-2.5 bg-[#e50914] text-white text-sm font-bold rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-600/20">
                  {t('settings.saveChanges')}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* 2. PREFERENCES SECTION - Завжди доступна */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('settings.preferences')}</h2>
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl overflow-hidden shadow-sm transition-colors">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 border-b border-gray-100 dark:border-[#222] gap-4">
              <div>
                <h3 className="text-gray-900 dark:text-white font-bold text-sm md:text-base">{t('settings.appearance')}</h3>
                <p className="text-gray-500 dark:text-[#8c8c8c] text-[10px] md:text-xs mt-0.5">{t('settings.appearanceDesc')}</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-[#111] p-1 rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
                <button type="button" onClick={() => dispatch(setTheme('light'))} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${themeMode === 'light' ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900 dark:text-[#8c8c8c] dark:hover:text-white border border-transparent'}`}>
                  ☀️ {t('theme.light', 'Light')}
                </button>
                <button type="button" onClick={() => dispatch(setTheme('dark'))} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${themeMode === 'dark' ? 'bg-[#2a2a2a] text-white shadow-sm border border-[#444]' : 'text-gray-500 hover:text-gray-900 dark:text-[#8c8c8c] dark:hover:text-white border border-transparent'}`}>
                  🌙 {t('theme.dark', 'Dark')}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 gap-4">
              <div>
                <h3 className="text-gray-900 dark:text-white font-bold text-sm md:text-base">{t('settings.language')}</h3>
                <p className="text-gray-500 dark:text-[#8c8c8c] text-[10px] md:text-xs mt-0.5">{t('settings.langDesc')}</p>
              </div>
              <select value={i18n.resolvedLanguage} onChange={(e) => changeLanguage(e.target.value)} className="bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a] text-gray-900 dark:text-white text-xs md:text-sm font-bold rounded-xl px-4 py-2.5 outline-none focus:border-[#e50914] cursor-pointer transition-colors">
                <option value="en">English (US)</option>
                <option value="uk">Українська</option>
              </select>
            </div>
          </div>
        </section>

        {/* 3. HELP & FAQ SECTION */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('settings.helpGuide')}</h2>
          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl overflow-hidden transition-colors shadow-sm">
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex items-center justify-between p-4 md:p-5 text-left focus:outline-none">
                  <span className="text-gray-900 dark:text-white font-bold text-xs md:text-sm">{faq.q}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-4 md:px-5 pb-5 pt-1 text-gray-600 dark:text-[#8c8c8c] text-xs md:text-sm leading-relaxed border-t border-gray-100 dark:border-[#222] animate-in fade-in slide-in-from-top-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};