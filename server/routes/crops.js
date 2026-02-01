import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    createListing,
    getListings,
    getListing,
    showInterest,
    updateListing,
    deleteListing,
    getMyListings
} from '../controllers/cropController.js';

const router = express.Router();

router.post('/', protect, createListing);
router.get('/', getListings);
router.get('/my/listings', protect, getMyListings);
router.get('/:id', getListing);
router.post('/:id/interest', protect, showInterest);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

export default router;

