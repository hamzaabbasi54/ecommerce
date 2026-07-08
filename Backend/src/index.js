import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';
import userRoutes from '../routes/userRoutes.js';
import productRoutes from '../routes/productRoutes.js';
import categoryRoutes from '../routes/categoryRoutes.js';
import brandRoutes from '../routes/brandRoutes.js';
import cartRoutes from '../routes/cartRoutes.js';
import wishlistRoutes from '../routes/wishlistRoutes.js';
import reviewRoutes from '../routes/reviewRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json()); 
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
