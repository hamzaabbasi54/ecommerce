import jwt from 'jsonwebtoken';
import prisma from '../database/prisma.js';

export const protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in the cookies
    token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    try {
        // 2. Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find the user in the database
        // We use 'select' to grab everything EXCEPT the password for security
        req.user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }

        // 4. If everything is good, proceed to the controller!
        next();
    } catch (error) {
        console.error('Middleware Error:', error.message);
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

// Bonus: Admin Middleware
// Use this to protect routes that ONLY admins should access (like deleting products)
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next(); // User is an admin, let them through
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
};
