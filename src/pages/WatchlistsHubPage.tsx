/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { CreateListModal } from "../components/CreateListModal/CreateListModal";
import api from "../api/axios";

export const WatchlistsHubPage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  
  const [userLists, setUserLists] = useState<any[]>([]);
  const [publicLists, setPublicLists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // ВИДАЛЯЄМО зайве /api/
      const [myRes, publicRes] = await Promise.all([
        api.get('/lists'),   
        api.get('/lists/public') 
      ]);
      
      console.log("My Lists from DB:", myRes.data);

      const myOwnLists = myRes.data.filter((l: any) => String(l.user_id) === String(user.id));
      setUserLists(myOwnLists);
      
      const othersPublicLists = publicRes.data.filter((l: any) => String(l.user_id) !== String(user.id));
      setPublicLists(othersPublicLists);
    } catch (err) {
      console.error("Failed to sync collections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#111] text-gray-900 dark:text-white">
        <p className="font-bold uppercase tracking-widest opacity-50 italic text-sm">Access Denied. Authentication Required.</p>
      </div>
    );
  }

  // Спільний компонент картки для обох секцій
  const RenderListCard = ({ list, isPublic }: { list: any, isPublic: boolean }) => (
    <Link 
      key={list.id} 
      to={`/WatchList/${list.id}`} 
      className="group flex flex-col bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-[#e50914] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="h-32 bg-gray-100 dark:bg-[#222] relative overflow-hidden flex items-center justify-center">
        {list.poster_url ? (
          <>
            <img src={list.poster_url} alt="blur" className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-40 blur-md scale-110" />
            <img src={list.poster_url} alt="Cover" className="h-[80%] object-cover z-10 shadow-lg rounded" />
          </>
        ) : (
          <span className="text-4xl opacity-20 dark:opacity-10">🎬</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1a1a1a] via-transparent to-transparent opacity-80" />
      </div>

      <div className="p-4 flex flex-col gap-1 relative z-10 bg-white dark:bg-[#1a1a1a]">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-gray-900 dark:text-white font-bold truncate group-hover:text-[#e50914]">{list.name}</h3>
          
          {/* Показуємо юзернейм якщо це чужий список, або замок якщо свій приватний */}
          {isPublic ? (
            <span className="text-[9px] text-[#e50914] font-black uppercase border border-[#e50914]/30 px-1.5 py-0.5 rounded leading-none italic">
              {list.profiles?.username}
            </span>
          ) : (
            !list.is_public && <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          )}
        </div>
        
        <p className="text-gray-500 dark:text-[#8c8c8c] text-[11px] line-clamp-1 h-4">{list.description || 'No briefing available.'}</p>
        
        <div className="mt-3 flex items-center justify-between">
           <span className="text-[10px] font-bold text-gray-400 dark:text-[#444] uppercase tracking-widest">
             {list.list_items?.length || 0} Titles
           </span>
           {isPublic && <span className="text-[10px] text-green-500 font-black italic">▲ {list.likes || 0}</span>}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50 dark:bg-[#111] overflow-y-auto transition-colors duration-300">
      {isCreateModalOpen && <CreateListModal onClose={() => setIsCreateModalOpen(false)} onListCreated={fetchData} />}

      <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#222] px-8 py-6">
        <h1 className="text-gray-900 dark:text-white text-2xl font-bold tracking-tight uppercase italic font-black">My Library</h1>
        <p className="text-gray-500 dark:text-[#8c8c8c] text-sm mt-1 transition-colors duration-300 italic">Strategic assets and global community collections.</p>
      </header>

      <div className="px-8 py-8 flex flex-col gap-12">
        
        {/* SECTION 1: YOUR LISTS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 dark:text-white text-lg font-semibold flex items-center gap-2"><span>📚</span> Your Lists</h2>
            <button onClick={() => setIsCreateModalOpen(true)} className="text-sm font-medium text-[#e50914] hover:text-red-600 transition-colors uppercase font-black">+ Create List</button>
          </div>
          
          {isLoading ? (
            <div className="h-40 flex items-center justify-center animate-pulse text-gray-400 text-xs font-bold uppercase">Syncing...</div>
          ) : userLists.length === 0 ? (
            <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 dark:border-[#222] rounded-3xl text-gray-500 text-sm">No personal lists detected. Try relogging if you just registered.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userLists.map(list => <RenderListCard key={list.id} list={list} isPublic={false} />)}
            </div>
          )}
        </section>

        {/* SECTION 2: DISCOVER */}
        <section className="border-t border-gray-200 dark:border-[#222] pt-8 mb-12">
          <h2 className="text-gray-900 dark:text-white text-lg font-semibold mb-6"><span>🌍</span> Discover Public Lists</h2>
          {publicLists.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">No external collections detected.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {publicLists.map(list => <RenderListCard key={list.id} list={list} isPublic={true} />)}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};