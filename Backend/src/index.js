import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from '../routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json()); 
app.use(cookieParser());


app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
