import i18n from '../i18n'; // Імпортуємо наш конфіг i18n

const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TOKEN}`
  }
};

const getTMDBLanguage = () => {
  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
  return currentLang === 'uk' ? 'uk-UA' : 'en-US';
};

export const fetchMovies = async (endpoint: string, page: number = 1) => {
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const lang = getTMDBLanguage(); 
    
    const response = await fetch(`${BASE_URL}${endpoint}${separator}language=${lang}&page=${page}`, options);
    
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    return { results: data.results, totalPages: data.total_pages };
  } catch (error) {
    console.error("Помилка при завантаженні фільмів:", error);
    return { results: [], totalPages: 0 };
  }
};

export const fetchMovieDetails = async (id: string) => {
  try {
    const lang = getTMDBLanguage(); 
    

    const response = await fetch(`${BASE_URL}/movie/${id}?language=${lang}&append_to_response=credits,videos`, options);
    
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return await response.json();
  } catch (error) {
    console.error("Помилка при завантаженні деталей фільму:", error);
    return null;
  }
};