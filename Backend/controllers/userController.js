import prisma from '../database/prisma.js';

// ==================== PROFILE ====================

// GET /api/users/profile
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                profileImage: true,
                isVerified: true,
                createdAt: true,
                addresses: true,
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'Profile fetched successfully', data: user });
    } catch (error) {
        console.error('Error in getProfile:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// PUT /api/users/profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        // If changing email, check if it's already taken by another user
        if (email && email !== req.user.email) { // this if block check if the email is send and if send then is it same as the old one
            const emailExists = await prisma.user.findUnique({ where: { email } });// this check that the new entered email is not used by any other in the db 
            if (emailExists) {
                return res.status(409).json({ success: false, message: 'Email already in use by another account' });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(email && { email }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                profileImage: true,
            }
        });

        res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedUser });
    } catch (error) {
        console.error('Error in updateProfile:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// PUT /api/users/profile/image
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image file provided' });
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { profileImage: imageUrl },
            select: {
                id: true,
                name: true,
                profileImage: true,
            }
        });

        res.status(200).json({ success: true, message: 'Profile image uploaded successfully', data: updatedUser });
    } catch (error) {
        console.error('Error in uploadProfileImage:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// ==================== ADDRESSES ====================

// POST /api/users/addresses
export const addAddress = async (req, res) => {
    try {
        const { label, street, city, province, postalCode, country, isDefault } = req.body;

        if (!label || !street || !city || !province || !postalCode || !country) {
            return res.status(400).json({ success: false, message: 'All address fields are required' });
        }

        // If this address is set as default, unset all other defaults for this user
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false }
            });
        }

        const address = await prisma.address.create({
            data: {
                label,
                street,
                city,
                province,
                postalCode,
                country,
                isDefault: isDefault || false,
                userId: req.user.id,
            }
        });

        res.status(201).json({ success: true, message: 'Address added successfully', data: address });
    } catch (error) {
        console.error('Error in addAddress:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// GET /api/users/addresses
export const getAddresses = async (req, res) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user.id },
            orderBy: { isDefault: 'desc' } // Default address appears first
        });

        res.status(200).json({ success: true, message: 'Addresses fetched successfully', data: addresses });
    } catch (error) {
        console.error('Error in getAddresses:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// PUT /api/users/addresses/:id
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { label, street, city, province, postalCode, country, isDefault } = req.body;

        // Verify ownership — user can only edit their own addresses
        const address = await prisma.address.findUnique({ where: { id } });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        if (address.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this address' });
        }

        // If setting as default, unset all others first
        if (isDefault) {
            await prisma.address.updateMany({
                where: { userId: req.user.id },
                data: { isDefault: false }
            });
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: {
                ...(label && { label }),
                ...(street && { street }),
                ...(city && { city }),
                ...(province && { province }),
                ...(postalCode && { postalCode }),
                ...(country && { country }),
                ...(isDefault !== undefined && { isDefault }),
            }
        });

        res.status(200).json({ success: true, message: 'Address updated successfully', data: updatedAddress });
    } catch (error) {
        console.error('Error in updateAddress:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// DELETE /api/users/addresses/:id
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        // Verify ownership
        const address = await prisma.address.findUnique({ where: { id } });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        if (address.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this address' });
        }

        await prisma.address.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error in deleteAddress:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
