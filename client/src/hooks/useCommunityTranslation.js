import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translateText } from '../api/translationApi';

/**
 * Custom hook for translating community data dynamically
 * Uses API for user-created communities, caches results in memory
 */
export const useCommunityTranslation = () => {
  const { language } = useLanguage();
  const [translationCache, setTranslationCache] = useState({});

  // Clear cache when language changes
  useEffect(() => {
    setTranslationCache({});
  }, [language]);

  /**
   * Translate a single text with caching
   */
  const translateDynamic = useCallback(async (text, sourceId) => {
    if (!text || language === 'en') {
      return text;
    }

    // Check cache first
    const cacheKey = `${language}-${sourceId || text}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      // Call API for translation
      const translated = await translateText(text, language, sourceId);
      
      // Store in cache
      setTranslationCache(prev => ({
        ...prev,
        [cacheKey]: translated
      }));

      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original
    }
  }, [language, translationCache]);

  return { translateDynamic, language };
};
