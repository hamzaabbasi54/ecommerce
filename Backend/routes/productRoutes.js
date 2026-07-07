import express from 'express';
import { getProducts, getProductById } from '../controllers/productController.js';
import { getProductReviews } from '../controllers/reviewController.js';

const router = express.Router();

// --- Public Product Routes (No auth required) ---
router.get('/', getProducts);           // Browse all products with search/filter/sort/pagination
router.get('/:id', getProductById);     // View single product details
router.get('/:productId/reviews', getProductReviews); // Get all reviews for a specific product

export default router;
