import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TranslationContext = createContext();

const translations = {
  en: () => import('../locales/en/common.json'),
  hi: () => import('../locales/hi/common.json'),
  bn: () => import('../locales/bn/common.json'),
  te: () => import('../locales/te/common.json'),
  mr: () => import('../locales/mr/common.json'),
  ta: () => import('../locales/ta/common.json'),
  gu: () => import('../locales/gu/common.json'),
  kn: () => import('../locales/kn/common.json'),
  ml: () => import('../locales/ml/common.json'),
  pa: () => import('../locales/pa/common.json'),
  or: () => import('../locales/or/common.json'),
  as: () => import('../locales/as/common.json')
};

export const TranslationProvider = ({ children }) => {
  const { language } = useLanguage();
  const [translationData, setTranslationData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        console.log('Loading translations for language:', language);
        const module = await translations[language]();
        console.log('Loaded translation module:', module);
        const translationData = module.default || module;
        console.log('Translation data:', translationData);
        setTranslationData(translationData);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        const fallback = await translations.en();
        setTranslationData(fallback.default || fallback);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const t = (key, params = {}) => {
    let text = translationData[key] || key;
    
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
    
    return text;
  };

  const translateContent = async (text, targetLang = language) => {
    if (!text || targetLang === 'en') return text;
    
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
      const data = await response.json();
      return data.responseData.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const value = {
    t,
    translateContent,
    loading,
    language
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export default TranslationContext;