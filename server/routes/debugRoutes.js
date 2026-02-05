import express from 'express';
import { languageDetector } from '../middleware/languageDetector.js';
import translationOrchestrator from '../services/translationOrchestrator.js';
import axios from 'axios';

const router = express.Router();

// Debug endpoint to check translation system
router.get('/debug', languageDetector, async (req, res) => {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      languageDetection: {
        detectedLanguage: req.userLanguage,
        supportedLanguages: req.supportedLanguages,
        headers: {
          'x-language': req.headers['x-language'],
          'accept-language': req.headers['accept-language']
        }
      },
      translationService: {
        url: process.env.TRANSLATION_SERVICE_URL || 'http://localhost:8002',
        status: 'unknown'
      },
      testTranslation: null
    };

    // 1. Check if Python translation service is running
    try {
      const serviceResponse = await axios.get(`${results.translationService.url}/health`, { timeout: 5000 });
      results.translationService.status = 'running';
      results.translationService.response = serviceResponse.data;
    } catch (error) {
      results.translationService.status = 'not_running';
      results.translationService.error = error.message;
    }

    // 2. Test translation if service is running and language is not English
    if (results.translationService.status === 'running' && req.userLanguage !== 'en') {
      try {
        const testResult = await translationOrchestrator.translateContent(
          'Hello World',
          req.userLanguage,
          'debug_test',
          'debug_hello_world'
        );
        results.testTranslation = testResult;
      } catch (error) {
        results.testTranslation = { error: error.message };
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;