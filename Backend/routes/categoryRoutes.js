import express from 'express';
import { getCategories, getCategoryById } from '../controllers/categoryController.js';

const router = express.Router();

// --- Public Category Routes (No auth required) ---
router.get('/', getCategories);         // Get all categories (tree structure)
router.get('/:id', getCategoryById);    // Get single category with its products

export default router;
