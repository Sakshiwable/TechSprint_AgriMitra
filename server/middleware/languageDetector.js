/**
 * Language Detection Middleware
 * Detects user's preferred language from multiple sources
 */

const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'ta', 'te', 'kn', 'bn', 'gu', 'ml', 'pa', 'or', 'as'];
const DEFAULT_LANGUAGE = 'en';

export const languageDetector = async (req, res, next) => {
  try {
    let detectedLang = DEFAULT_LANGUAGE;
    
    // Priority 1: Query parameter (?lang=hi)
    if (req.query.lang && SUPPORTED_LANGUAGES.includes(req.query.lang)) {
      detectedLang = req.query.lang;
    }
    
    // Priority 2: Custom header (X-Language)
    else if (req.headers['x-language'] && SUPPORTED_LANGUAGES.includes(req.headers['x-language'])) {
      detectedLang = req.headers['x-language'];
    }
    
    // Priority 3: Accept-Language header
    else if (req.headers['accept-language']) {
      const browserLang = req.headers['accept-language']
        .split(',')[0]
        .split('-')[0]
        .toLowerCase();
      
      if (SUPPORTED_LANGUAGES.includes(browserLang)) {
        detectedLang = browserLang;
      }
    }
    
    // Priority 4: User profile (if authenticated)
    else if (req.user && req.user.languagePreference) {
      if (SUPPORTED_LANGUAGES.includes(req.user.languagePreference)) {
        detectedLang = req.user.languagePreference;
      }
    }
    
    // Attach to request
    req.userLanguage = detectedLang;
    req.supportedLanguages = SUPPORTED_LANGUAGES;
    
    next();
    
  } catch (error) {
    console.error('Language detection error:', error);
    req.userLanguage = DEFAULT_LANGUAGE;
    next();
  }
};

export default languageDetector;
