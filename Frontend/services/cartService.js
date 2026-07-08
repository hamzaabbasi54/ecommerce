import axiosInstance from '@/utils/axiosInstance';

/**
 * Cart Service — 1:1 mirror of /api/cart endpoints
 * All routes are protected (JWT required)
 * No logic, no state, no React — just pass params and return response.data
 */

/** GET /api/cart */
export const getCart = async () => {
  const res = await axiosInstance.get('/api/cart');
  return res.data; // { success, message, data }
};

/**
 * POST /api/cart
 * @param {Object} body - { productId, quantity }
 */
export const addToCart = async ({ productId, quantity }) => {
  const res = await axiosInstance.post('/api/cart', { productId, quantity });
  return res.data;
};

/**
 * PUT /api/cart/items/:itemId
 * @param {string} itemId - CartItem ID
 * @param {number} quantity - New quantity
 */
export const updateCartItem = async (itemId, quantity) => {
  const res = await axiosInstance.put(`/api/cart/items/${itemId}`, { quantity });
  return res.data;
};

/**
 * DELETE /api/cart/items/:itemId
 * @param {string} itemId - CartItem ID
 */
export const removeFromCart = async (itemId) => {
  const res = await axiosInstance.delete(`/api/cart/items/${itemId}`);
  return res.data;
};
