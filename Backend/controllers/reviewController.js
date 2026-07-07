import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/reviews
// Add a review to a product
export const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const ratingNum = parseInt(rating);

        if (!productId || !ratingNum) {
            return res.status(400).json({ success: false, message: 'Product ID and rating are required' });
        }

        if (ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        // 1. Verify product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.deletedAt) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // 2. Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: productId
                }
            }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product. Please edit your existing review.'
            });
        }

        // 3. Create review
        const review = await prisma.review.create({
            data: {
                userId: req.user.id,
                productId: productId,
                rating: ratingNum,
                comment: comment || null
            }
        });

        res.status(201).json({ success: true, message: 'Review added successfully', data: review });
    } catch (error) {
        console.error('Error in createReview:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// PUT /api/reviews/:reviewId
// Edit an existing review
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        // 1. Find review and ensure it belongs to the logged-in user
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        if (review.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this review' });
        }

        // 2. Validate new rating if provided
        let ratingNum;
        if (rating) {
            ratingNum = parseInt(rating);
            if (ratingNum < 1 || ratingNum > 5) {
                return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
            }
        }

        // 3. Update review
        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                ...(ratingNum && { rating: ratingNum }),
                ...(comment !== undefined && { comment: comment || null })
            }
        });

        res.status(200).json({ success: true, message: 'Review updated successfully', data: updatedReview });
    } catch (error) {
        console.error('Error in updateReview:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// DELETE /api/reviews/:reviewId
// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        // 1. Find review and ensure it belongs to the logged-in user
        const review = await prisma.review.findUnique({ where: { id: reviewId } });

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Only the user who created it (or an admin - not implemented here) can delete it
        if (review.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
        }

        // 2. Delete review
        await prisma.review.delete({ where: { id: reviewId } });

        res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error in deleteReview:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// GET /api/products/:productId/reviews
// Get all reviews for a specific product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product exists
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.deletedAt) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Fetch reviews and include reviewer details
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, message: 'Reviews fetched successfully', data: reviews });
    } catch (error) {
        console.error('Error in getProductReviews:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
