import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { productUpload, categoryUpload, brandUpload } from '../middlewares/uploadMiddleware.js';
import { createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { createBrand, updateBrand, deleteBrand } from '../controllers/brandController.js';

const router = express.Router();

// --- Admin Product Routes (Requires login + admin role) ---
router.post('/products', protect, admin, productUpload.array('images', 5), createProduct);
router.put('/products/:id', protect, admin, productUpload.array('images', 5), updateProduct);
router.delete('/products/:id', protect, admin, deleteProduct);

// --- Admin Category Routes (Requires login + admin role) ---
router.post('/categories', protect, admin, categoryUpload.single('image'), createCategory);
router.put('/categories/:id', protect, admin, categoryUpload.single('image'), updateCategory);
router.delete('/categories/:id', protect, admin, deleteCategory);

// --- Admin Brand Routes (Requires login + admin role) ---
router.post('/brands', protect, admin, brandUpload.single('logo'), createBrand);
router.put('/brands/:id', protect, admin, brandUpload.single('logo'), updateBrand);
router.delete('/brands/:id', protect, admin, deleteBrand);

export default router;
