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

// Import custom translation files
import { dashboardTranslations } from '../utils/dashboardTranslations';
import { commonTranslations } from '../utils/commonTranslations';
import { marketPricesTranslations } from '../utils/marketPricesTranslations';
import { communityTranslations } from '../utils/communityTranslations';
import { govSchemesTranslations } from '../utils/govSchemesTranslations';
import { authTranslations } from '../utils/authTranslations';

// Deep merge function
const deepMerge = (...objects) => {
  const result = {};
  objects.forEach(obj => {
    Object.keys(obj || {}).forEach(key => {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
        result[key] = deepMerge(result[key] || {}, obj[key]);
      } else {
        result[key] = obj[key];
      }
    });
  });
  return result;
};

// Merge all translations
const translations = {
  en: deepMerge(
    enTranslations,
    dashboardTranslations.en || {},
    commonTranslations.en || {},
    marketPricesTranslations.en || {},
    communityTranslations.en || {},
    govSchemesTranslations.en || {},
    authTranslations.en || {}
  ),
  hi: deepMerge(
    hiTranslations,
    dashboardTranslations.hi || {},
    commonTranslations.hi || {},
    marketPricesTranslations.hi || {},
    communityTranslations.hi || {},
    govSchemesTranslations.hi || {},
    authTranslations.hi || {}
  ),
  bn: deepMerge(
    bnTranslations,
    dashboardTranslations.bn || {},
    commonTranslations.bn || {},
    marketPricesTranslations.bn || {},
    communityTranslations.bn || {},
    govSchemesTranslations.bn || {},
    authTranslations.bn || {}
  ),
  te: deepMerge(
    teTranslations,
    dashboardTranslations.te || {},
    commonTranslations.te || {},
    marketPricesTranslations.te || {},
    communityTranslations.te || {},
    govSchemesTranslations.te || {},
    authTranslations.te || {}
  ),
  mr: deepMerge(
    mrTranslations,
    dashboardTranslations.mr || {},
    commonTranslations.mr || {},
    marketPricesTranslations.mr || {},
    communityTranslations.mr || {},
    govSchemesTranslations.mr || {},
    authTranslations.mr || {}
  ),
  ta: deepMerge(
    taTranslations,
    dashboardTranslations.ta || {},
    commonTranslations.ta || {},
    marketPricesTranslations.ta || {},
    communityTranslations.ta || {},
    govSchemesTranslations.ta || {},
    authTranslations.ta || {}
  ),
  gu: deepMerge(
    guTranslations,
    dashboardTranslations.gu || {},
    commonTranslations.gu || {},
    marketPricesTranslations.gu || {},
    communityTranslations.gu || {},
    govSchemesTranslations.gu || {},
    authTranslations.gu || {}
  ),
  kn: deepMerge(
    knTranslations,
    dashboardTranslations.kn || {},
    commonTranslations.kn || {},
    marketPricesTranslations.kn || {},
    communityTranslations.kn || {},
    govSchemesTranslations.kn || {},
    authTranslations.kn || {}
  ),
  ml: deepMerge(
    mlTranslations,
    dashboardTranslations.ml || {},
    commonTranslations.ml || {},
    marketPricesTranslations.ml || {},
    communityTranslations.ml || {},
    govSchemesTranslations.ml || {},
    authTranslations.ml || {}
  ),
  pa: deepMerge(
    paTranslations,
    dashboardTranslations.pa || {},
    commonTranslations.pa || {},
    marketPricesTranslations.pa || {},
    communityTranslations.pa || {},
    govSchemesTranslations.pa || {},
    authTranslations.pa || {}
  ),
  or: deepMerge(
    orTranslations,
    dashboardTranslations.or || {},
    commonTranslations.or || {},
    marketPricesTranslations.or || {},
    communityTranslations.or || {},
    govSchemesTranslations.or || {},
    authTranslations.or || {}
  ),
  as: deepMerge(
    asTranslations,
    dashboardTranslations.as || {},
    commonTranslations.as || {},
    marketPricesTranslations.as || {},
    communityTranslations.as || {},
    govSchemesTranslations.as || {},
    authTranslations.as || {}
  )
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

  // Helper to translate community names and descriptions
  const translateCommunity = (text, type = 'name') => {
    if (!text) return text;
    
    // First, check static translations (predefined communities)
    const currentTranslations = communityTranslations[language] || communityTranslations.en;
    const lookupKey = type === 'name' ? 'communityNames' : 'communityDescriptions';
    const staticTranslation = currentTranslations?.[lookupKey]?.[text];
    
    // If static translation exists, use it (instant, no API call needed)
    if (staticTranslation) {
      return staticTranslation;
    }
    
    // For user-created communities, return original text
    // Dynamic API translation will be handled at the component level
    return text;
  };

  return { t, translateCommunity };
};