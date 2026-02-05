import express from 'express';
import { protect } from '../middleware/auth.js';
import { languageDetector } from '../middleware/languageDetector.js';
import {
    getMarketPrices,
    getPriceHistory,
    getPriceStats,
    broadcastPriceUpdate
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/prices', languageDetector, getMarketPrices);
router.get('/prices/history/:commodity', languageDetector, getPriceHistory);
router.get('/prices/stats/:commodity', languageDetector, getPriceStats);
router.post('/broadcast', broadcastPriceUpdate); // Called by Python

export default router;

