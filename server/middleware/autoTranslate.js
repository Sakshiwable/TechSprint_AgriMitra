import translationOrchestrator from '../services/translationOrchestrator.js';

const translationCache = new Map();

const SKIP_FIELDS = [
  '_id', 'id', 'userId', 'createdAt', 'updatedAt', 'email', 'password',
  'token', 'url', 'src', 'href', 'image', 'avatar', 'file', 'path',
  'status', 'code', 'type', 'method', '__v', 'hash', 'salt'
];

const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'bn', 'gu', 'ml', 'pa', 'or', 'as'];

const shouldTranslateString = (str) => {
  if (!str || typeof str !== 'string' || str.length < 2) return false;
  
  const skipPatterns = [
    /^https?:\/\//,
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    /^[a-f0-9]{24}$/,
    /^\d+$/,
    /^[A-Z_]+$/,
    /\.(jpg|jpeg|png|gif|webp|svg|pdf|doc|docx)$/i,
  ];
  
  return !skipPatterns.some(pattern => pattern.test(str));
};

const translateText = async (text, targetLang) => {
  if (!shouldTranslateString(text) || targetLang === 'en' || !SUPPORTED_LANGUAGES.includes(targetLang)) {
    return text;
  }
  
  const cacheKey = `${text}_${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  
  try {
    const result = await Promise.race([
      translationOrchestrator.translateContent(
        text,
        targetLang,
        'auto_translate',
        cacheKey
      ),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Translation timeout')), 5000)
      )
    ]);
    
    const translatedText = result.text || text;
    translationCache.set(cacheKey, translatedText);
    return translatedText;
  } catch (error) {
    translationCache.set(cacheKey, text); // Cache original to avoid retries
    return text;
  }
};

const deepTranslateObject = async (obj, targetLang) => {
  if (typeof obj === 'string') {
    return await translateText(obj, targetLang);
  }
  
  if (Array.isArray(obj)) {
    const translated = [];
    for (const item of obj) {
      translated.push(await deepTranslateObject(item, targetLang));
    }
    return translated;
  }
  
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const translated = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SKIP_FIELDS.includes(key) || key.startsWith('_')) {
        translated[key] = value;
      } else {
        translated[key] = await deepTranslateObject(value, targetLang);
      }
    }
    return translated;
  }
  
  return obj;
};

export const autoTranslateMiddleware = async (req, res, next) => {
  const targetLang = req.userLanguage || 'en';
  
  if (targetLang === 'en' || !SUPPORTED_LANGUAGES.includes(targetLang)) {
    return next();
  }
  
  const originalJson = res.json;
  
  res.json = async function(data) {
    try {
      if (data && (typeof data === 'object' || Array.isArray(data))) {
        const translatedData = await deepTranslateObject(data, targetLang);
        return originalJson.call(this, translatedData);
      }
    } catch (error) {
      // Silent fallback
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

export const batchTranslate = async (texts, targetLang) => {
  if (targetLang === 'en') return texts;
  
  const translations = [];
  for (const text of texts) {
    translations.push(await translateText(text, targetLang));
  }
  return translations;
};

export const clearTranslationCache = () => {
  translationCache.clear();
};

export default autoTranslateMiddleware;