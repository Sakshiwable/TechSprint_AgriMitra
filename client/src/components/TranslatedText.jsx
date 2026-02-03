import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const TranslatedText = ({ 
  text, 
  contentType = 'general', 
  sourceId = null, 
  fallback = null,
  className = '',
  as = 'span'
}) => {
  const { t, loading, currentLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (!text || currentLanguage === 'en') {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await t(text, contentType, sourceId);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(fallback || text);
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, currentLanguage, contentType, sourceId, t, fallback]);

  const Component = as;
  const displayText = translatedText || fallback || text;

  return (
    <Component 
      className={`${className} ${isTranslating ? 'translating' : ''}`}
      title={isTranslating ? 'Translating...' : undefined}
    >
      {displayText}
      {isTranslating && (
        <span className="translation-indicator" style={{ marginLeft: '4px', opacity: 0.6 }}>
          ⟳
        </span>
      )}
    </Component>
  );
};

export default TranslatedText;