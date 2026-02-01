import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getAlerts,
    createAlert,
    markAsRead,
    broadcastAlert,
    getAlertStats
} from '../controllers/marketAlertController.js';

const router = express.Router();

router.get('/', protect, getAlerts);
router.get('/stats', protect, getAlertStats);
router.post('/', createAlert); // Admin/Python
router.post('/broadcast', broadcastAlert); // Python
router.put('/:id/read', protect, markAsRead);

export default router;

