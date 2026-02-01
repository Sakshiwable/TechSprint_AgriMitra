import express from 'express';
import {
  getMySchemes,
  getFiltersMetadata,
  triggerScrape,
  getScrapingStats,
  getSchemeById
} from '../controllers/schemeController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/myschemes', getMySchemes);
router.get('/myschemes/:id', getSchemeById);
router.get('/filters', getFiltersMetadata);

// Admin routes
router.post('/scrape', protect, admin, triggerScrape);
router.get('/scrape/stats', protect, admin, getScrapingStats);

export default router;
