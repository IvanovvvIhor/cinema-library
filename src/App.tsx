import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks"; // Додали хук
import { SideBar } from "./components/SideBar/SideBar";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MovieDetailsPage } from "./pages/MovieDetailsPage";
import { BottomNav } from "./components/BottomNav/BottomNav";
import { WatchlistsHubPage } from "./pages/WatchlistsHubPage";
import { WatchlistDetailPage } from "./pages/WatchlistDetailPage";
import { SettingsPage } from "./pages/SettingsPage";

export const App: React.FC = () => {
  const themeMode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <div className="flex min-h-screen bg-[#f5f5f5] text-[#111] dark:bg-[#111] dark:text-white transition-colors duration-300">
      <SideBar />
      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:filter" element={<CatalogPage />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/WatchList" element={<WatchlistsHubPage />} />
          <Route path="/WatchList/:id" element={<WatchlistDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
};