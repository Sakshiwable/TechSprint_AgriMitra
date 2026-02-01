import axios from 'axios';

const TRANSLATION_SERVICE_URL = process.env.TRANSLATION_SERVICE_URL || 'http://localhost:5005';

/**
 * Calls the Python Translation Microservice
 */
const fetchTranslation = async (text, targetLang, sourceLang = 'en') => {
    if (!text) return '';
    try {
        const response = await axios.post(`${TRANSLATION_SERVICE_URL}/translate`, {
            text,
            source: sourceLang,
            target: targetLang
        });
        return response.data.translated_text || text;
    } catch (error) {
        console.error(`[TranslationService] Error translating "${text}" to ${targetLang}:`, error.message);
        return text; // Fallback to original
    }
};

/**
 * Orchestrates translation for MarketPrice documents
 * @param {Object} doc - Mongoose document
 * @param {String} targetLang - Target language code (e.g., 'hi')
 * @returns {Object} Plain object with translated fields
 */
export const translateMarketPrice = async (doc, targetLang) => {
    if (!doc) return null;
    if (targetLang === 'en' || !targetLang) return doc.toObject ? doc.toObject() : doc;

    // Check if translation exists in Map
    // Note: doc.translations is a Map if getting from Mongoose
    const translationsMap = doc.translations;
    
    if (translationsMap && translationsMap.get(targetLang)) {
        // Return existing translation merged
        const cached = translationsMap.get(targetLang);
        return { 
            ...(doc.toObject ? doc.toObject() : doc), 
            ...cached,
            _isTranslated: true 
        };
    }

    console.log(`[TranslationService] Translating MarketPrice ${doc._id} to ${targetLang}...`);

    // Perform Translation
    const fieldsToTranslate = ['commodity', 'market', 'state'];
    const translatedData = {};

    // Parallel translation
    await Promise.all(fieldsToTranslate.map(async (field) => {
        if (doc[field]) {
            translatedData[field] = await fetchTranslation(doc[field], targetLang);
        }
    }));

    // Update Cache in Background (fire and forget vs await? Better await to ensure consistency)
    try {
        if (!doc.translations) {
            // If doc is a POJO, we can't save. Must be a mongoose doc.
            if (typeof doc.save !== 'function') {
                console.warn("[TranslationService] Document is not a Mongoose instance, cannot save cache.");
                return { ...doc, ...translatedData, _isTranslated: true };
            }
        }

        if (doc.translations instanceof Map) {
            doc.translations.set(targetLang, translatedData);
        } else {
             // If for some reason it's not a Map (e.g. lean()), we can't save easily
             // But schema defines it as Map.
        }
        
        await doc.save();
        console.log(`[TranslationService] Saved translation for ${doc._id}`);
        
    } catch (e) {
        console.error("[TranslationService] Error saving translation cache:", e);
    }

    return { 
        ...(doc.toObject ? doc.toObject() : doc), 
        ...translatedData,
        _isTranslated: true 
    };
};
