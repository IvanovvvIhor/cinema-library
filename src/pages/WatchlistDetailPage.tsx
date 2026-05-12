/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useTranslation } from "react-i18next";
import api from "../api/axios";

export const WatchlistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // @ts-expect-error: Variable reserved for future localization implementation
  const { t } = useTranslation();

  const user = useAppSelector((state) => state.auth.user);
  
  const [list, setList] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [externalUrl, setExternalUrl] = useState("");
  
  const [votes, setVotes] = useState({
    likes: 0,
    dislikes: 0,
    likedBy: [] as any[],
    dislikedBy: [] as any[]
  });

  const fetchListDetails = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/lists/${id}`);
      const data = response.data;
      setList(data);
      setVotes({
        likes: data.likes || 0,
        dislikes: data.dislikes || 0,
        likedBy: data.liked_by || [],
        dislikedBy: data.disliked_by || []
      });
    } catch (err: any) {
      console.error("Critical Failure in Sector Data Retrieval:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchListDetails();
  }, [id]);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center bg-[#0a0a0a] min-h-screen">
      <div className="w-10 h-10 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!list || (!list.is_public && String(list.user_id) !== String(user?.id))) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#111] text-white font-black uppercase italic">
        <span className="text-4xl mb-4">🚷</span>
        <h2 className="text-xl mb-2 tracking-[0.2em]">Access Denied</h2>
        <button onClick={() => navigate(-1)} className="px-8 py-2 bg-[#e50914] text-white rounded-xl mt-4 hover:scale-105 transition-transform">Return to Base</button>
      </div>
    );
  }

  const isOwner = String(user?.id) === String(list.user_id);

  // #region Хендлери
  const handleVote = async (type: 'like' | 'dislike') => {
    if (!user) return alert("Authentication required for voting operations.");
    if (isOwner) return;
    try {
      const response = await api.post(`/lists/${list.id}/vote`, { type });
      setVotes({
        likes: response.data.likes || 0,
        dislikes: response.data.dislikes || 0,
        likedBy: response.data.liked_by || [],
        dislikedBy: response.data.disliked_by || []
      });
    } catch (err: any) {
      console.error("Vote processing failure:", err);
    }
  };

  const handleUpdateCover = async (posterPath: string) => {
    if (!posterPath) return;
    try {
      await api.put(`/lists/${id}`, { poster_url: posterPath });
      setList((prev: any) => ({ ...prev, poster_url: posterPath }));
      setIsUrlInputOpen(false);
      setExternalUrl("");
    } catch (err) {
      console.error("Visual asset deployment failed:", err);
    }
  };

  const handleRemoveMovie = async (movie_id: number) => {
    try {
        await api.delete(`/watchlist/${movie_id}`); 
        setList((prev: any) => ({
            ...prev,
            list_items: prev.list_items.filter((item: any) => item.movie_id !== movie_id)
        }));
    } catch (err) {
        console.error("Asset purge failed:", err);
    }
  };
  // #endregion

  const coverImage = list.poster_url || (list.list_items?.length > 0 ? list.list_items[0].poster_path : null);
  
  // Безпечна перевірка, чи голосував юзер (переводимо все в String для порівняння)
  const hasLiked = user && votes.likedBy.some(id => String(id) === String(user.id));
  const hasDisliked = user && votes.dislikedBy.some(id => String(id) === String(user.id));

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#0a0a0a] overflow-y-auto relative transition-colors duration-300">
      
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none opacity-20 overflow-hidden">
        {coverImage && <img key={`bg-${coverImage}`} src={coverImage} alt="blur" className="w-full h-full object-cover blur-[120px] scale-150 animate-in fade-in duration-1000" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-12 px-8 py-16 max-w-[1400px] mx-auto w-full">
        
        {/* SIDEBAR: SECTOR INFO & COVER CONTROL */}
        <aside className="w-full md:w-[320px] flex-shrink-0 flex flex-col gap-8">
          <div className="relative group/cover w-full aspect-[2/3] bg-[#111] rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            {coverImage ? (
              <img key={coverImage} src={coverImage} alt={list.name} className="w-full h-full object-cover animate-in fade-in duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-10">🎬</div>
            )}

            {/* OVERLAY FOR URL UPDATE */}
            {isOwner && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md opacity-0 group-hover/cover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center">
                {!isUrlInputOpen ? (
                  <button 
                    onClick={() => setIsUrlInputOpen(true)}
                    className="px-6 py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:scale-105 transition-transform"
                  >
                    Change Cover
                  </button>
                ) : (
                  <div className="w-full animate-in slide-in-from-bottom-2 duration-300">
                    <input 
                      type="text"
                      placeholder="Paste Image URL..."
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-[10px] mb-3 outline-none focus:border-[#e50914] font-bold"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateCover(externalUrl)}
                        className="flex-1 py-2 bg-[#e50914] text-white font-black uppercase text-[9px] rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Deploy
                      </button>
                      <button 
                        onClick={() => setIsUrlInputOpen(false)}
                        className="px-3 py-2 bg-white/10 text-white font-black uppercase text-[9px] rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-gray-900 dark:text-white text-4xl font-black uppercase italic tracking-tighter leading-none">{list.name}</h1>
            <p className="text-gray-500 dark:text-[#888] text-sm font-medium italic">"{list.description || 'No briefing available.'}"</p>
            
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#e50914]">
                {list.is_public ? '🌍 Public Domain' : '🔒 Internal Asset'}
                <span className="w-1 h-1 bg-gray-500 rounded-full" />
                <span className="text-gray-500">{list.list_items?.length || 0} Units</span>
            </div>

            {!isOwner && user && (
                <div className="grid grid-cols-2 gap-3 mt-4 bg-white dark:bg-[#111] p-4 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-xl">
                    <button onClick={() => handleVote('like')} className={`flex flex-col items-center py-4 rounded-2xl transition-all ${hasLiked ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 hover:text-green-500'}`}>
                        <span className="text-2xl font-black italic">{votes.likes}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest">Support</span>
                    </button>
                    <button onClick={() => handleVote('dislike')} className={`flex flex-col items-center py-4 rounded-2xl transition-all ${hasDisliked ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-gray-50 dark:bg-[#1a1a1a] text-gray-500 hover:text-red-500'}`}>
                        <span className="text-2xl font-black italic">{votes.dislikes}</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest">Reject</span>
                    </button>
                </div>
            )}
          </div>
        </aside>

        {/* MAIN: ASSET LIST */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col gap-3">
            {!list.list_items || list.list_items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[3rem]">
                <span className="text-gray-400 font-black uppercase italic tracking-widest opacity-30 text-sm">Sector Empty</span>
                <Link to="/catalog" className="mt-6 px-10 py-3 bg-[#e50914] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all">Sourcing Data →</Link>
              </div>
            ) : (
              list.list_items.map((item: any, index: number) => (
                <div key={item.id} className="group flex items-center gap-6 p-4 rounded-[1.5rem] hover:bg-white dark:hover:bg-[#121212] transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/5">
                  <div className="w-6 text-center text-gray-400 font-black italic text-xs group-hover:text-[#e50914]">{index + 1}</div>
                  
                  <Link to={`/movie/${item.movie_id}`} className="shrink-0 relative overflow-hidden rounded-lg shadow-lg">
                    <img src={item.poster_path} alt={item.movie_title} className="w-12 h-18 object-cover group-hover:scale-110 transition-transform duration-500" />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/movie/${item.movie_id}`} className="text-gray-900 dark:text-white font-bold text-sm block truncate hover:text-[#e50914] transition-colors">{item.movie_title}</Link>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                            {item.runtime > 0 ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : 'Units Unknown'}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-[#333] rounded-full" />
                        <span className="text-[#e50914] text-[10px] font-black italic">⭐ {item.rating ? item.rating.toFixed(1) : '0.0'}</span>
                    </div>
                  </div>
                  
                  {isOwner && (
                    <div className="flex items-center gap-3 ml-auto">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateCover(item.poster_path); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all cursor-pointer"
                          title="Assign as list cover"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </button>
                        
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveMovie(item.movie_id); }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                          title="Purge asset"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};