import axios from 'axios';

const setupAxiosInterceptors = (language) => {
  axios.interceptors.request.use(
    (config) => {
      config.headers['X-Language'] = language;
      return config;
    },
    (error) => Promise.reject(error)
  );
};

class TranslationService {
  constructor() {
    this.cache = new Map();
  }

  async translateText(text, targetLang) {
    if (!text || targetLang === 'en' || typeof text !== 'string') {
      return text;
    }

    const cacheKey = `${text}_${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
      );
      const data = await response.json();
      
      // Check for API limit error
      if (data.responseData?.translatedText?.includes('MYMEMORY WARNING')) {
        throw new Error('Translation service limit reached');
      }
      
      const translatedText = data.responseData?.translatedText || text;
      
      this.cache.set(cacheKey, translatedText);
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }
}

export const translationService = new TranslationService();

export const initializeTranslation = (language) => {
  setupAxiosInterceptors(language);
};

export default translationService;