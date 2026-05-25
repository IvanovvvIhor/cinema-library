/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store/hooks';
import api from '../api/axios'; // ВИКОРИСТОВУЄМО ТВІЙ AXIOS
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// --- ТИПІЗАЦІЯ ДАНИХ ---
interface RatingDistribution {
  [key: string]: number;
}

interface Timeline {
  [key: string]: number;
}

interface AnalyticsApiResponse {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  timeline: Timeline;
}

interface ChartRatingItem {
  rating: string;
  count: number;
}

interface ChartTimelineItem {
  month: string;
  actions: number;
}

interface FormattedStats {
  totalReviews: number;
  averageRating: number;
  formattedRatings: ChartRatingItem[];
  formattedTimeline: ChartTimelineItem[];
}

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<FormattedStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  const themeMode = useAppSelector((state) => state.theme.mode);

  const chartColors = {
    text: themeMode === 'dark' ? '#888888' : '#6b7280',
    grid: themeMode === 'dark' ? '#222222' : '#e5e7eb',
    element: themeMode === 'dark' ? '#ffffff' : '#111111',
    tooltipBg: themeMode === 'dark' ? '#000000' : '#ffffff',
    tooltipBorder: themeMode === 'dark' ? '#333333' : '#e5e7eb',
    tooltipText: themeMode === 'dark' ? '#ffffff' : '#000000',
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Використовуємо твій api замість сирого fetch
        const response = await api.get('/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // axios автоматично парсить JSON, тому дані лежать у response.data
        const data: AnalyticsApiResponse = response.data;

        const formattedRatings: ChartRatingItem[] = Object.entries(data.ratingDistribution).map(([key, value]) => ({
          rating: key,
          count: value
        }));

        const formattedTimeline: ChartTimelineItem[] = Object.entries(data.timeline)
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([key, value]) => ({
            month: key,
            actions: value
          }));

        setStats({
          totalReviews: data.totalReviews,
          averageRating: data.averageRating,
          formattedRatings,
          formattedTimeline
        });

      } catch (err: any) {
        console.error("Analytics fetch error:", err);
        // axios загортає помилки в err.response
        const errorMsg = err.response?.data?.error || err.message || t('analytics.unknownError', 'Невідома помилка');
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [t]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 dark:text-neutral-500 flex items-center justify-center font-mono text-sm transition-colors duration-300">
        {t('analytics.loading', 'Завантаження даних...')}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-red-600 dark:text-red-500 flex items-center justify-center font-mono text-sm transition-colors duration-300">
        {error || t('analytics.noData', 'Немає даних для відображення')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-4 md:p-10 font-mono transition-colors duration-300">
      <header className="flex flex-col items-start mb-10 border-b border-gray-200 dark:border-neutral-800 pb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-xs mb-3 transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          &larr; {t('analytics.backToProfile', 'Назад до профілю')}
        </button>
        <h1 className="text-2xl font-black uppercase italic tracking-wide m-0">
          {t('analytics.title', 'Персональна статистика')}
        </h1>
      </header>

      <div className="flex flex-wrap gap-6 mb-10">
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 p-6 rounded-2xl flex flex-col gap-2 min-w-[160px] shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-neutral-500 uppercase tracking-widest font-bold">
            {t('analytics.totalReviews', 'Всього рецензій')}
          </span>
          <span className="text-3xl font-black">{stats.totalReviews}</span>
        </div>
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 p-6 rounded-2xl flex flex-col gap-2 min-w-[160px] shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-neutral-500 uppercase tracking-widest font-bold">
            {t('analytics.averageRating', 'Середній бал')}
          </span>
          <span className="text-3xl font-black">{stats.averageRating}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm">
          <h2 className="text-sm text-gray-500 dark:text-neutral-500 mt-0 mb-6 font-bold uppercase tracking-widest italic">
            {t('analytics.ratingDistribution', 'Розподіл оцінок')}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.formattedRatings} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="rating" stroke={chartColors.text} tick={{ fontSize: 12, fill: chartColors.text }} />
              <YAxis stroke={chartColors.text} tick={{ fontSize: 12, fill: chartColors.text }} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: themeMode === 'dark' ? '#222' : '#f3f4f6' }} 
                contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, fontSize: '12px', color: chartColors.tooltipText, borderRadius: '8px' }} 
                itemStyle={{ color: chartColors.tooltipText }}
              />
              <Bar dataKey="count" fill={chartColors.element} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 p-6 rounded-2xl shadow-sm">
          <h2 className="text-sm text-gray-500 dark:text-neutral-500 mt-0 mb-6 font-bold uppercase tracking-widest italic">
            {t('analytics.activityTimeline', 'Хронологія активності')}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.formattedTimeline} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="month" stroke={chartColors.text} tick={{ fontSize: 12, fill: chartColors.text }} />
              <YAxis stroke={chartColors.text} tick={{ fontSize: 12, fill: chartColors.text }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, fontSize: '12px', color: chartColors.tooltipText, borderRadius: '8px' }} 
                itemStyle={{ color: chartColors.tooltipText }}
              />
              <Line type="monotone" dataKey="actions" stroke={chartColors.element} strokeWidth={2} dot={{ r: 4, fill: chartColors.tooltipBg, stroke: chartColors.element, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;