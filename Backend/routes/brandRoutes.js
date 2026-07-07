import express from 'express';
import { getBrands, getBrandById } from '../controllers/brandController.js';

const router = express.Router();

// --- Public Brand Routes (No auth required) ---
router.get('/', getBrands);          // Get all brands
router.get('/:id', getBrandById);    // Get single brand with its products

export default router;
