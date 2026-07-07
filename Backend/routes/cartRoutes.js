import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    addToCart,
    getCart,
    updateCartItemQuantity,
    removeFromCart
} from '../controllers/cartController.js';

const router = express.Router();

// --- Protected Cart Routes ---
router.post('/', protect, addToCart);
router.get('/', protect, getCart);
router.put('/items/:itemId', protect, updateCartItemQuantity);
router.delete('/items/:itemId', protect, removeFromCart);

export default router;
