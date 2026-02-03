import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { initializeTranslation } from '../utils/translationService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    // Priority: localStorage > browser locale > default
    const stored = localStorage.getItem('userLanguage');
    if (stored) return stored;
    
    const browserLang = navigator.language.split('-')[0];
    const supported = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa', 'or', 'as'];
    return supported.includes(browserLang) ? browserLang : 'en';
  });
  
  const [loading, setLoading] = useState(false);
  
  const availableLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' }
  ];
  
  const setLanguage = async (newLang) => {
    if (!availableLanguages.find(l => l.code === newLang)) {
      console.error(`Unsupported language: ${newLang}`);
      return;
    }
    
    setLoading(true);
    
    try {
      // Update local state and storage
      setLanguageState(newLang);
      localStorage.setItem('userLanguage', newLang);
      
      // Initialize comprehensive translation system
      initializeTranslation(newLang);
      
      // Update user profile if authenticated
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.patch(
            `${API_URL}/api/users/language`,
            { languagePreference: newLang },
            { 
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'X-Language': newLang
              } 
            }
          );
        } catch (error) {
          console.warn('Failed to update user language preference:', error.message);
        }
      }
      
      // Trigger page reload to fetch translated content
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: newLang } }));
      
    } catch (error) {
      console.error('Language change error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Set axios default header for all requests and initialize translation
  useEffect(() => {
    axios.defaults.headers.common['X-Language'] = language;
    initializeTranslation(language);
  }, [language]);
  
  const value = {
    language,
    setLanguage,
    availableLanguages,
    supportedLanguages: availableLanguages, // Backward compatibility
    loading,
    currentLanguage: availableLanguages.find(l => l.code === language)
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
