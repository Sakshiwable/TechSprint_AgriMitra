import { useLanguage } from '../contexts/LanguageContext';
import { useCallback } from 'react';

const translations = {
  en: {
    // Common UI
    'Filter By': 'Filter By',
    'Reset': 'Reset',
    'Search': 'Search',
    'Select': 'Select',
    'All Schemes': 'All Schemes',
    'State Schemes': 'State Schemes',
    'Central Schemes': 'Central Schemes',
    'We found': 'We found',
    'schemes based on your preferences': 'schemes based on your preferences',
    'No description available': 'No description available',
    'State': 'State',
    'Agriculture': 'Agriculture',
    'Gender': 'Gender',
    'Age': 'Age',
    'Caste': 'Caste',
    'Residence': 'Residence',
    'Benefit Type': 'Benefit Type',
    'Disability Percentage': 'Disability Percentage',
    'Employment Status': 'Employment Status',
    'Occupation': 'Occupation',
    'Male': 'Male',
    'Female': 'Female',
    'Transgender': 'Transgender',
    'Urban': 'Urban',
    'Rural': 'Rural',
    'Financial': 'Financial',
    'Education': 'Education',
    'Health': 'Health',
    'Employed': 'Employed',
    'Unemployed': 'Unemployed',
    'Self-Employed': 'Self-Employed',
    'Farmer': 'Farmer',
    'Student': 'Student',
    'Business': 'Business',
    'Professional': 'Professional',
    'Relevance': 'Relevance',
    'Name': 'Name',
    'Previous': 'Previous',
    'Next': 'Next',
    'Page': 'Page',
    'of': 'of'
  },
  hi: {
    'Filter By': 'फ़िल्टर करें',
    'Reset': 'रीसेट',
    'Search': 'खोजें',
    'Select': 'चुनें',
    'All Schemes': 'सभी योजनाएं',
    'State Schemes': 'राज्य योजनाएं',
    'Central Schemes': 'केंद्रीय योजनाएं',
    'We found': 'हमें मिली',
    'schemes based on your preferences': 'योजनाएं आपकी प्राथमिकताओं के आधार पर',
    'No description available': 'कोई विवरण उपलब्ध नहीं',
    'State': 'राज्य',
    'Agriculture': 'कृषि',
    'Gender': 'लिंग',
    'Age': 'आयु',
    'Caste': 'जाति',
    'Residence': 'निवास',
    'Benefit Type': 'लाभ प्रकार',
    'Disability Percentage': 'विकलांगता प्रतिशत',
    'Employment Status': 'रोजगार स्थिति',
    'Occupation': 'व्यवसाय',
    'Male': 'पुरुष',
    'Female': 'महिला',
    'Transgender': 'ट्रांसजेंडर',
    'Urban': 'शहरी',
    'Rural': 'ग्रामीण',
    'Financial': 'वित्तीय',
    'Education': 'शिक्षा',
    'Health': 'स्वास्थ्य',
    'Employed': 'नियोजित',
    'Unemployed': 'बेरोजगार',
    'Self-Employed': 'स्व-नियोजित',
    'Farmer': 'किसान',
    'Student': 'छात्र',
    'Business': 'व्यापार',
    'Professional': 'पेशेवर',
    'Relevance': 'प्रासंगिकता',
    'Name': 'नाम',
    'Previous': 'पिछला',
    'Next': 'अगला',
    'Page': 'पृष्ठ',
    'of': 'का'
  }
};

export const useTranslate = () => {
  const { language } = useLanguage();
  
  const t = useCallback((key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  }, [language]);
  
  return { t };
};