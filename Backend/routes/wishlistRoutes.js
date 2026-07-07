import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

// --- Protected Wishlist Routes ---
router.post('/', protect, addToWishlist);
router.get('/', protect, getWishlist);
router.delete('/:productId', protect, removeFromWishlist);

export default router;
