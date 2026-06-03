/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export const PublicCollections: React.FC = () => {
  const [publicLists, setPublicLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublic = async () => {
      try {
        const res = await api.get('/lists/public');
        setPublicLists(res.data);
      } catch (err) {
        console.error("Failed to load public lists");
      } finally {
        setLoading(false);
      }
    };
    fetchPublic();
  }, []);

  if (loading) return <div className="h-40 flex items-center justify-center animate-pulse text-gray-500 italic uppercase text-xs tracking-widest font-black">Scanning Community Sectors...</div>;

  return (
    <section className="border-t border-gray-200 dark:border-[#222] pt-12 mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-gray-900 dark:text-white text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <span className="text-[#e50914] text-3xl">🌍</span> Community Boards
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publicLists.map((list) => (
          <Link 
            key={list.id} 
            to={`/WatchList/${list.id}`}
            className="group relative bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#222] rounded-[2rem] p-5 flex gap-5 hover:border-[#e50914]/50 transition-all duration-500 hover:translate-y-[-4px] shadow-xl dark:shadow-none"
          >
            <div className="w-24 h-32 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                <img 
                    src={list.poster_url || 'https://via.placeholder.com/300x450?text=No+Cover'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt="cover" 
                />
            </div>
            <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
                <div>
                    <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-tight truncate group-hover:text-[#e50914] transition-colors">{list.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">By <span className="text-gray-600 dark:text-gray-300">{list.profiles?.username}</span></p>
                </div>
                <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg border border-gray-200 dark:border-white/5">
                        <span className="text-[10px] text-green-500 font-black">▲ {list.likes}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};