import { useLanguage } from '../contexts/LanguageContext';
import enTranslations from '../locales/en/common.json';
import hiTranslations from '../locales/hi/common.json';
import bnTranslations from '../locales/bn/common.json';
import teTranslations from '../locales/te/common.json';
import mrTranslations from '../locales/mr/common.json';
import taTranslations from '../locales/ta/common.json';
import guTranslations from '../locales/gu/common.json';
import knTranslations from '../locales/kn/common.json';
import mlTranslations from '../locales/ml/common.json';
import paTranslations from '../locales/pa/common.json';
import orTranslations from '../locales/or/common.json';
import asTranslations from '../locales/as/common.json';

const translations = {
  en: enTranslations,
  hi: hiTranslations,
  bn: bnTranslations,
  te: teTranslations,
  mr: mrTranslations,
  ta: taTranslations,
  gu: guTranslations,
  kn: knTranslations,
  ml: mlTranslations,
  pa: paTranslations,
  or: orTranslations,
  as: asTranslations
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key, params = {}) => {
    const currentTranslations = translations[language] || translations.en;
    let text = currentTranslations?.[key] || key;
    
    if (typeof text !== 'string') {
      console.warn(`Translation for key '${key}' is not a string:`, text);
      return key;
    }
    
    Object.keys(params).forEach(param => {
      text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
    });
    
    return text;
  };

  return { t };
};