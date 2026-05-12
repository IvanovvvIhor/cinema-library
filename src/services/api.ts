import i18n from '../i18n';
import api from '../api/axios'; 

const getTMDBLanguage = () => {
  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
  return currentLang === 'uk' ? 'uk-UA' : 'en-US';
};


export const fetchMovies = async (endpoint: string, page: number = 1) => {
  try {
    const lang = getTMDBLanguage();
    
    const response = await api.get('/movies/proxy', { 
      params: { 
        endpoint,
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