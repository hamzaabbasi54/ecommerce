import prisma from '../database/prisma.js';

// Helper function to get or create a cart for the logged-in user
const getOrCreateCart = async (userId) => {
    let cart = await prisma.cart.findUnique({
        where: { userId }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId }
        });
    }

    return cart;
};

// POST /api/cart
// Add an item to the cart or increase quantity if it exists
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const requestedQuantity = parseInt(quantity) || 1;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        if (requestedQuantity <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be greater than 0' });
        }

        // 1. Verify product exists and check stock
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product || product.deletedAt || !product.isActive) {
            return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
        }

        if (product.stock < requestedQuantity) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} items left in stock` });
        }

        // 2. Get or create the user's cart
        const cart = await getOrCreateCart(req.user.id);

        // 3. Check if the product is already in the cart
        const existingCartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId
            }
        });

        const priceAtAdd = product.discountPrice ? product.discountPrice : product.price;

        if (existingCartItem) {
            // Update quantity of existing item
            const newQuantity = existingCartItem.quantity + requestedQuantity;

            if (newQuantity > product.stock) {
                return res.status(400).json({ success: false, message: `Cannot add more. Only ${product.stock} items total in stock` });
            }

            await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: {
                    quantity: newQuantity,
                    priceAtAdd: priceAtAdd // Update price to latest
                }
            });
        } else {
            // Create a new cart item
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId,
                    quantity: requestedQuantity,
                    priceAtAdd: priceAtAdd
                }
            });
        }

        res.status(200).json({ success: true, message: 'Item added to cart successfully' });
    } catch (error) {
        console.error('Error in addToCart:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// GET /api/cart
// Get the user's cart with details and calculated total
export const getCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                discountPrice: true,
                                images: true,
                                stock: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: 'Cart is empty',
                data: {
                    items: [],
                    cartTotal: 0
                }
            });
        }

        // Calculate dynamic cart total
        let cartTotal = 0;
        cart.items.forEach(item => {
            cartTotal += item.priceAtAdd * item.quantity;
        });

        res.status(200).json({
            success: true,
            message: 'Cart fetched successfully',
            data: {
                ...cart,
                cartTotal
            }
        });
    } catch (error) {
        console.error('Error in getCart:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// PUT /api/cart/items/:itemId
// Update the exact quantity of a cart item
export const updateCartItemQuantity = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const requestedQuantity = parseInt(quantity);

        if (isNaN(requestedQuantity) || requestedQuantity <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid quantity' });
        }

        const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        // Find the cart item and ensure it belongs to the user's cart
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id
            },
            include: { product: true }
        });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        // Verify stock
        if (requestedQuantity > cartItem.product.stock) {
            return res.status(400).json({ success: false, message: `Only ${cartItem.product.stock} items left in stock` });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: requestedQuantity }
        });

        res.status(200).json({ success: true, message: 'Cart item updated', data: updatedItem });
    } catch (error) {
        console.error('Error in updateCartItemQuantity:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// DELETE /api/cart/items/:itemId
// Remove an item from the cart
export const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        // Verify the item exists and belongs to the user's cart
        const cartItem = await prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: cart.id
            }
        });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        await prisma.cartItem.delete({
            where: { id: itemId }
        });

        res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Error in removeFromCart:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
