import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { profileUpload } from '../middlewares/uploadMiddleware.js';
import {
    getProfile,
    updateProfile,
    uploadProfileImage,
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress
} from '../controllers/userController.js';

const router = express.Router();

// --- Profile Routes ---
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/profile/image', protect, profileUpload.single('image'), uploadProfileImage);

// --- Address Routes ---
router.post('/addresses', protect, addAddress);
router.get('/addresses', protect, getAddresses);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

export default router;
