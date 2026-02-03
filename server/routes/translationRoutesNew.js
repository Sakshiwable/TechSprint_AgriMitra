import express from 'express';
import { translateText, translateBatch, getTranslationStats, invalidateCache } from '../controllers/translationControllerNew.js';
import { languageDetector } from '../middleware/languageDetector.js';

const router = express.Router();

// Apply language detection middleware to all routes
router.use(languageDetector);

// POST /api/translate/text - Translate single text
router.post('/text', translateText);

// POST /api/translate/batch - Batch translate multiple texts
router.post('/batch', translateBatch);

// GET /api/translate/stats - Get translation statistics
router.get('/stats', getTranslationStats);

// DELETE /api/translate/cache/:sourceId - Invalidate specific cache
router.delete('/cache/:sourceId', invalidateCache);

export default router;