import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

/**
 * Translate text using the backend translation API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'mr', 'hi')
 * @param {string} sourceId - Unique ID for caching (optional)
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, targetLang, sourceId = null) => {
  try {
    if (!text || targetLang === 'en') {
      return text;
    }

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/translate/text`,
      {
        text,
        targetLang,
        contentType: 'community',
        sourceId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.translatedText) {
      return response.data.translatedText;
    }

    return text; // Fallback to original
  } catch (error) {
    console.error('Translation API error:', error);
    return text; // Fallback to original on error
  }
};

/**
 * Batch translate multiple texts
 * @param {Array} items - Array of {text, id} objects
 * @param {string} targetLang - Target language code
 * @returns {Promise<Array>} Array of translated texts
 */
export const batchTranslate = async (items, targetLang) => {
  try {
    if (!items || items.length === 0 || targetLang === 'en') {
      return items.map(item => item.text);
    }

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/translate/batch`,
      {
        items: items.map(item => ({
          text: item.text,
          sourceId: item.id,
          type: 'community'
        })),
        targetLang
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success && response.data.results) {
      return response.data.results.map(result => result.text);
    }

    return items.map(item => item.text); // Fallback
  } catch (error) {
    console.error('Batch translation API error:', error);
    return items.map(item => item.text); // Fallback
  }
};
