/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import type { ListVisibility } from '../../types/Watchlist';
import api from '../../api/axios';

interface CreateListModalProps {
  onClose: () => void;
  onListCreated?: (newList: any) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({ onClose, onListCreated }) => {
  const user = useAppSelector((state) => state.auth.user);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [visibility, setVisibility] = useState<ListVisibility>('Private');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/lists', {
        name: title.trim(),
        description: description.trim(), // Передаємо опис
        is_public: visibility === 'Public',
        poster_url: coverUrl.trim() || null
      });

      // Викликаємо оновлення списку у батьківському компоненті
      if (onListCreated) {
        onListCreated(response.data);
      }

      onClose(); // Просто закриваємо, без reload!
    } catch (err: any) {
      // Якщо ID в токені застарілий, сервер видасть 400/401/403
      setError(err.response?.data?.error || 'System Failure: Foreign Key Violation. Try relogging.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm outline-none transition-all focus:border-[#e50914] placeholder:text-gray-400 dark:placeholder:text-gray-700";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-md transition-all">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-[#e50914] transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">New Collection</h2>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">Architecture of your cinematic asset</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 italic">Title *</label>
            <input required type="text" placeholder="e.g. METAL & FIRE" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 italic">Description</label>
            <textarea rows={2} placeholder="Briefing..." value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} resize-none`} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 italic">Poster URL</label>
            <input type="url" placeholder="https://..." value={coverUrl} onChange={e => setCoverUrl(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 italic">Visibility</label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-white/5">
                <button type="button" onClick={() => setVisibility('Private')} className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all ${visibility === 'Private' ? 'bg-white dark:bg-[#1a1a1a] text-[#e50914] shadow-sm' : 'text-gray-500'}`}>🔒 Internal</button>
                <button type="button" onClick={() => setVisibility('Public')} className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all ${visibility === 'Public' ? 'bg-white dark:bg-[#1a1a1a] text-[#e50914] shadow-sm' : 'text-gray-500'}`}>🌍 Public</button>
            </div>
          </div>

          {error && <p className="text-[#e50914] text-[10px] font-black uppercase text-center">{error}</p>}

          <button type="submit" disabled={isLoading} className="mt-4 w-full bg-[#e50914] text-white font-black uppercase tracking-[0.2em] text-xs py-4 rounded-2xl hover:bg-red-600 transition-all disabled:opacity-50">
            {isLoading ? 'Deploying...' : 'Establish Collection'}
          </button>
        </form>
      </div>
    </div>
  );
};