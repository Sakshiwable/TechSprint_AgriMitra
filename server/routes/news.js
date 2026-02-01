import express from 'express';
import {
    getNewsAlerts,
    getDemandSignals,
    getAllDemandSignals
} from '../controllers/newsController.js';

const router = express.Router();

// Specific routes MUST come before dynamic parameter routes
router.get('/signals', getAllDemandSignals);
router.get('/signals/:commodity', getDemandSignals);
router.get('/:commodity', getNewsAlerts);

export default router;
