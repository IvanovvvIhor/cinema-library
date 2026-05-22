import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Тип відповіді від нашого Node.js сервера
interface AnalyticsApiResponse {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  timeline: Timeline;
}

// Типи для графіків Recharts
interface ChartRatingItem {
  rating: string;
  count: number;
}

interface ChartTimelineItem {
  month: string;
  actions: number;
}

// Фінальний стан компонента
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

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Запит до нашого бекенду. 
        // Важливо: додаємо credentials, щоб передати кукі з токеном для middleware protect
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Якщо ти зберігаєш токен в localStorage, розкоментуй рядок нижче:
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include', // Для роботи з кукі
        });

        if (!response.ok) {
          throw new Error('Помилка авторизації або сервера');
        }

        const data: AnalyticsApiResponse = await response.json();

        // Форматування для Recharts (оскільки Recharts вимагає масив об'єктів)
        const formattedRatings: ChartRatingItem[] = Object.entries(data.ratingDistribution).map(([key, value]) => ({
          rating: key,
          count: value
        }));

        // Сортування хронології за датою (зростання)
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

      } catch (err) {
        console.error("Помилка завантаження аналітики:", err);
        setError(err instanceof Error ? err.message : 'Невідома помилка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-neutral-500 flex items-center justify-center font-mono text-sm">
        Завантаження даних...
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-mono text-sm">
        {error || 'Немає даних для відображення'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-10 font-mono">
      <header className="flex flex-col items-start mb-10 border-b border-neutral-800 pb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-neutral-500 hover:text-white text-xs mb-3 transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          &larr; Назад до профілю
        </button>
        <h1 className="text-2xl font-medium tracking-wide m-0">Персональна статистика</h1>
      </header>

      <div className="flex gap-6 mb-10">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded flex flex-col gap-2 min-w-[160px]">
          <span className="text-[11px] text-neutral-500 uppercase tracking-widest">Всього рецензій</span>
          <span className="text-3xl font-bold">{stats.totalReviews}</span>
        </div>
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded flex flex-col gap-2 min-w-[160px]">
          <span className="text-[11px] text-neutral-500 uppercase tracking-widest">Середній бал</span>
          <span className="text-3xl font-bold">{stats.averageRating}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded">
          <h2 className="text-sm text-neutral-500 mt-0 mb-6 font-normal uppercase tracking-widest">Розподіл оцінок</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.formattedRatings} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="rating" stroke="#888" tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis stroke="#888" tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#111' }} 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '12px', color: '#fff' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#fff" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0a0a0a] border border-neutral-800 p-6 rounded">
          <h2 className="text-sm text-neutral-500 mt-0 mb-6 font-normal uppercase tracking-widest">Хронологія активності</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.formattedTimeline} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="month" stroke="#888" tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis stroke="#888" tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '12px', color: '#fff' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="actions" stroke="#fff" strokeWidth={2} dot={{ r: 4, fill: '#000', stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;