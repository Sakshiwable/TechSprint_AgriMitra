import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getMarketPrices,
    getPriceHistory,
    getPriceStats,
    broadcastPriceUpdate
} from '../controllers/marketController.js';

const router = express.Router();

router.get('/prices', getMarketPrices);
router.get('/prices/history/:commodity', getPriceHistory);
router.get('/prices/stats/:commodity', getPriceStats);
router.post('/broadcast', broadcastPriceUpdate); // Called by Python

export default router;

