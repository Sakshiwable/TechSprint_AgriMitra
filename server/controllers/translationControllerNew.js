import translationOrchestrator from '../services/translationOrchestrator.js';

// POST /api/translate/text - Translate any text content
export const translateText = async (req, res) => {
  try {
    const { text, targetLang, contentType = 'general', sourceId } = req.body;
    const target = targetLang || req.userLanguage || 'en';
    
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }
    
    const result = await translationOrchestrator.translateContent(
      text,
      target,
      contentType,
      sourceId
    );
    
    res.json({
      success: true,
      translatedText: result.text,
      confidence: result.confidence,
      source: result.source,
      error: result.error
    });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      translatedText: req.body.text // Fallback to original
    });
  }
};

// POST /api/translate/batch - Batch translate multiple texts
export const translateBatch = async (req, res) => {
  try {
    const { items, targetLang } = req.body;
    const target = targetLang || req.userLanguage || 'en';
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, error: 'Items array is required' });
    }
    
    const results = await translationOrchestrator.batchTranslate(items, target);
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// GET /api/translate/stats - Get translation statistics
export const getTranslationStats = async (req, res) => {
  try {
    const stats = await translationOrchestrator.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/translate/cache/:sourceId - Invalidate cache
export const invalidateCache = async (req, res) => {
  try {
    const { sourceId } = req.params;
    const success = await translationOrchestrator.invalidateCache(sourceId);
    res.json({ success, message: success ? 'Cache invalidated' : 'Cache not found' });
  } catch (error) {
    console.error('Cache invalidation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export default { translateText, translateBatch, getTranslationStats, invalidateCache };