import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../database/prisma.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }  
        
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }   

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role: role === 'ADMIN' ? 'ADMIN' : 'USER',
            },
        });

        generateToken(res, user.id, user.role);
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error in register controller: ", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        generateToken(res, user.id, user.role);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Error in login controller: ", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const logout = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error("Error in logout controller: ", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 1. Generate a random reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // 2. Hash token and save to database (so if DB is leaked, tokens are safe)
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // 3. Set expiry to 10 minutes from now
        const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken,
                resetPasswordExpire
            }
        });

        // 4. Build the reset URL and email HTML
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        const html = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display:inline-block; padding:12px 24px; background-color:#4F46E5; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;">
                Reset Password
            </a>
            <p style="margin-top:16px; color:#666;">This link will expire in <strong>10 minutes</strong>.</p>
            <p style="color:#999;">If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Request',
                html,
            });

            res.status(200).json({ success: true, message: 'Password reset email sent' });
        } catch (emailError) {
            // If email fails, rollback: clear the token from DB
            await prisma.user.update({
                where: { email },
                data: {
                    resetPasswordToken: null,
                    resetPasswordExpire: null,
                },
            });
            console.error("Email sending failed: ", emailError.message);
            res.status(500).json({ success: false, message: 'Email could not be sent' });
        }

    } catch (error) {
        console.error("Error in forgotPassword: ", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        // Token comes from the URL (e.g. /resetpassword/abc123token)
        const resetToken = req.params.resetToken;
        const { password } = req.body;

        // Hash the token from the URL to compare it with the hashed one in DB
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Find user with this token and ensure it hasn't expired
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken,
                resetPasswordExpire: { gt: new Date() } // 'gt' = strictly greater than current time
            }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user and clear out the token fields
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpire: null
            }
        });

        res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error("Error in resetPassword: ", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        // req.user is guaranteed to exist because of the 'protect' middleware
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword }
        });

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error("Error in changePassword: ", error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
