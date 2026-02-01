import express from 'express';
import {
    getWeatherByState,
    getWeatherHistory,
    getWeatherImpact
} from '../controllers/weatherController.js';

const router = express.Router();

router.get('/state/:state', getWeatherByState);
router.get('/history/:state', getWeatherHistory);
router.get('/impact', getWeatherImpact);

export default router;
