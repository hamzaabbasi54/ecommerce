/**
 * Guest → User merge logic.
 *
 * Transfers a guest's cart items and wishlist entries to a registered user
 * account, then cleans up the guest's cart/wishlist rows (but not the Guest
 * row itself or any orders linked to it).
 *
 * Called from the register and login route handlers when a guest_token
 * cookie is present on the incoming request.
 */
import prisma from '@/lib/prisma';

/**
 * Merge a guest's cart and wishlist into a user account.
 *
 * Cart merge rules (mirrors app/api/cart POST logic):
 *   - Skip products that are soft-deleted, inactive, or out of stock.
 *   - If the product already exists in the user's cart, sum the quantities
 *     (capped at current stock) and update priceAtAdd to the current price.
 *   - Otherwise create a new CartItem on the user's cart.
 *
 * Wishlist merge rules (mirrors app/api/wishlist POST logic):
 *   - Skip products that are soft-deleted or inactive.
 *   - Skip if the user already has that product wishlisted (unique constraint).
 *
 * @param {string} userId - The authenticated user's id.
 * @param {string} guestId - The guest's id (from the guest_token cookie).
 * @returns {Promise<{ skippedCartItems: Array, skippedWishlistItems: Array }>}
 */
export async function mergeGuestIntoUser(userId, guestId) {
  const skippedCartItems = [];
  const skippedWishlistItems = [];

  // ─── Cart Merge ──────────────────────────────────────────────────

  // Fetch guest cart with items + product data
  const guestCart = await prisma.cart.findUnique({
    where: { guestId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (guestCart && guestCart.items.length > 0) {
    // Get or create user cart (same pattern as app/api/cart/route.js)
    let userCart = await prisma.cart.findUnique({ where: { userId } });
    if (!userCart) {
      userCart = await prisma.cart.create({ data: { userId } });
    }

    for (const guestItem of guestCart.items) {
      const product = guestItem.product;

      // Skip unavailable products
      if (!product || product.deletedAt || !product.isActive) {
        skippedCartItems.push({
          productId: guestItem.productId,
          name: product?.name || 'Unknown product',
          reason: 'Product is no longer available',
        });
        continue;
      }

      if (product.stock <= 0) {
        skippedCartItems.push({
          productId: guestItem.productId,
          name: product.name,
          reason: 'Out of stock',
        });
        continue;
      }

      const currentPrice = product.discountPrice || product.price;

      // Check if user already has this product in their cart
      const existingUserItem = await prisma.cartItem.findFirst({
        where: { cartId: userCart.id, productId: guestItem.productId },
      });

      if (existingUserItem) {
        // Sum quantities, capped at stock
        const combinedQuantity = existingUserItem.quantity + guestItem.quantity;
        const finalQuantity = Math.min(combinedQuantity, product.stock);

        await prisma.cartItem.update({
          where: { id: existingUserItem.id },
          data: { quantity: finalQuantity, priceAtAdd: currentPrice },
        });
      } else {
        // New item — cap at stock
        const finalQuantity = Math.min(guestItem.quantity, product.stock);

        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            quantity: finalQuantity,
            priceAtAdd: currentPrice,
          },
        });
      }
    }

    // Delete guest cart items, then the guest cart row itself
    await prisma.cartItem.deleteMany({ where: { cartId: guestCart.id } });
    await prisma.cart.delete({ where: { id: guestCart.id } });
  }

  // ─── Wishlist Merge ──────────────────────────────────────────────

  const guestWishlistItems = await prisma.wishlist.findMany({
    where: { guestId },
    include: { product: true },
  });

  for (const guestWish of guestWishlistItems) {
    const product = guestWish.product;

    // Skip unavailable products
    if (!product || product.deletedAt || !product.isActive) {
      skippedWishlistItems.push({
        productId: guestWish.productId,
        name: product?.name || 'Unknown product',
        reason: 'Product is no longer available',
      });
      continue;
    }

    // Check if user already has this product wishlisted (unique constraint)
    const existingUserWish = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId: guestWish.productId } },
    });

    if (existingUserWish) {
      skippedWishlistItems.push({
        productId: guestWish.productId,
        name: product.name,
        reason: 'Already in your wishlist',
      });
    } else {
      await prisma.wishlist.create({
        data: { userId, productId: guestWish.productId },
      });
    }
  }

  // Delete all guest wishlist rows
  await prisma.wishlist.deleteMany({ where: { guestId } });

  return { skippedCartItems, skippedWishlistItems };
}

/**
 * Retroactively link orphaned guest orders to a user account based on email matching.
 * This ensures that a guest placing orders across different devices will eventually
 * have all their orders correctly linked to their central account profile.
 *
 * @param {string} userId - The authenticated user's id.
 * @param {string} userEmail - The authenticated user's email address.
 * @returns {Promise<number>} - The count of orders successfully linked.
 */
export async function linkGuestOrdersByEmail(userId, userEmail) {
  if (!userId || !userEmail) return 0;

  try {
    const result = await prisma.order.updateMany({
      where: {
        userId: null,
        contactEmail: {
          equals: userEmail,
          mode: 'insensitive',
        },
      },
      data: {
        userId: userId,
      },
    });

    return result.count;
  } catch (error) {
    console.error('Error linking guest orders:', error);
    return 0;
  }
}
