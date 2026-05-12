import i18n from '../i18n';
import api from '../api/axios'; 

const getTMDBLanguage = () => {
  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
  return currentLang === 'uk' ? 'uk-UA' : 'en-US';
};


export const fetchMovies = async (endpoint: string, page: number = 1) => {
  try {
    const lang = getTMDBLanguage();
    
    const [path, queryString] = endpoint.split('?');
    
    // 2. Перетворюємо рядок параметрів у зручний об'єкт
    const existingParams = queryString ? Object.fromEntries(new URLSearchParams(queryString)) : {};

    // 3. Робимо запит до нашого проксі
    const response = await api.get('/movies/proxy', { 
      params: { 
        endpoint: path, // Передаємо ТІЛЬКИ чистий шлях
        page,
        language: lang,
        ...existingParams // Додаємо всі інші фільтри (жанри, сортування)
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