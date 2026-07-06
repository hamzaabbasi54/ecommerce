import express from 'express';
import { register, login, logout, forgotPassword, resetPassword, changePassword } from '../controllers/authcontrollers.js';
import { protect } from '../middlewares/authMiddleware.js'; 

const router = express.Router();

// --- Authentication Routes ---
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// --- Password Management Routes ---
// 1. Forgot Password (Takes an email, sends a token)
router.post('/forgotpassword', forgotPassword);

// 2. Reset Password (Takes the token from the URL params, saves new password)
router.put('/resetpassword/:resetToken', resetPassword);

// 3. Change Password (Requires user to be logged in, uses 'protect' gatekeeper)
router.put('/changepassword', protect, changePassword);

export default router;
