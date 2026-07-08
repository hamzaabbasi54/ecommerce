import jwt from 'jsonwebtoken';

// Now receiving 'role' as the third argument
const generateToken = (res, userId, role) => {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, 
  });
};

export default generateToken;
