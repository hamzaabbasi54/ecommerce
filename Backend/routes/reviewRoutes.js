import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { createReview, updateReview, deleteReview } from '../controllers/reviewController.js';

const router = express.Router();

// --- Protected Review Routes ---
router.post('/', protect, createReview);
router.put('/:reviewId', protect, updateReview);
router.delete('/:reviewId', protect, deleteReview);

export default router;
