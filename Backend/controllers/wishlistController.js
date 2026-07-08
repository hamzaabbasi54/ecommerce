import prisma from '../database/prisma.js';

// POST /api/wishlist
// Add a product to the user's wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        // 1. Verify the product exists and is active
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.deletedAt || !product.isActive) {
            return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
        }

        // 2. Check if the product is already in the wishlist (Duplicate Check)
        const existingItem = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: productId
                }
            }
        });

        if (existingItem) {
            return res.status(400).json({ success: false, message: 'Product is already in your wishlist' });
        }

        // 3. Add to wishlist
        await prisma.wishlist.create({
            data: {
                userId: req.user.id,
                productId: productId
            }
        });

        res.status(200).json({ success: true, message: 'Added to wishlist successfully' });
    } catch (error) {
        console.error('Error in addToWishlist:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// GET /api/wishlist
// Get the user's entire wishlist
export const getWishlist = async (req, res) => {
    try {
        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId: req.user.id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        discountPrice: true,
                        images: true,
                        stock: true,
                        isActive: true,
                        deletedAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Filter out any products that were soft-deleted or made inactive by an admin
        // after the user added them to their wishlist
        const validItems = wishlistItems
            .filter(item => item.product.deletedAt === null && item.product.isActive === true)
            .map(item => ({
                id: item.id,
                productId: item.productId,
                addedAt: item.createdAt,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    slug: item.product.slug,
                    price: item.product.price,
                    discountPrice: item.product.discountPrice,
                    images: item.product.images,
                    stock: item.product.stock
                }
            }));

        res.status(200).json({
            success: true,
            message: 'Wishlist fetched successfully',
            data: validItems
        });
    } catch (error) {
        console.error('Error in getWishlist:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// DELETE /api/wishlist/:productId
// Remove a product from the wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Find the specific wishlist record
        const wishlistItem = await prisma.wishlist.findUnique({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: productId
                }
            }
        });

        if (!wishlistItem) {
            return res.status(404).json({ success: false, message: 'Product not found in your wishlist' });
        }

        // 2. Delete the record
        await prisma.wishlist.delete({
            where: {
                userId_productId: {
                    userId: req.user.id,
                    productId: productId
                }
            }
        });

        res.status(200).json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Error in removeFromWishlist:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
