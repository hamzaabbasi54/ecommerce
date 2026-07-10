import axiosInstance from '@/utils/axiosInstance';

/**
 * Wishlist Service — 1:1 mirror of /api/wishlist endpoints
 * All routes are protected (JWT required)
 */

/** GET /api/wishlist */
export const getWishlist = async () => {
  const res = await axiosInstance.get('/api/wishlist');
  return res.data; // { success, message, data }
};

/**
 * POST /api/wishlist
 * @param {string} productId 
 */
export const addToWishlist = async (productId) => {
  const res = await axiosInstance.post('/api/wishlist', { productId });
  return res.data;
};

/**
 * DELETE /api/wishlist/:productId
 * @param {string} productId 
 */
export const removeFromWishlist = async (productId) => {
  const res = await axiosInstance.delete(`/api/wishlist/${productId}`);
  return res.data;
};
