import i18n from '../i18n';
import api from '../api/axios'; // Твій налаштований axios, що веде на Render

const getTMDBLanguage = () => {
  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
  return currentLang === 'uk' ? 'uk-UA' : 'en-US';
};

// Використовуємо _endpoint, щоб TS не сварився на невикористану змінну
export const fetchMovies = async (_endpoint: string, page: number = 1) => {
  try {
    const lang = getTMDBLanguage();
    // Стукаємо на наш проксі-ендпоінт на Render
    const response = await api.get('/movies/trending', { 
      params: { 
        page,
        language: lang 
      } 
    });
    
    return { 
      results: response.data.results, 
      totalPages: response.data.total_pages 
    };
  } catch (error) {
    console.error("Помилка проксі-завантаження списку:", error);
    return { results: [], totalPages: 0 };
  }
};

export const fetchMovieDetails = async (id: string) => {
  try {
    const lang = getTMDBLanguage();
    const response = await api.get(`/movies/${id}`, {
      params: { language: lang }
    });
    
    return response.data;
  } catch (error) {
    console.error("Помилка проксі-завантаження деталей:", error);
    return null;
  }
};