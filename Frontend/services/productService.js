import axiosInstance from '@/utils/axiosInstance';

/**
 * Product Service — 1:1 mirror of /api/products endpoints
 * No logic, no state, no React — just pass params and return response.data
 */

/**
 * GET /api/products
 * @param {Object} params - Query params: { page, limit, search, category, brand, minPrice, maxPrice, sort }
 */
export const getProducts = async (params = {}) => {
  const res = await axiosInstance.get('/api/products', { params });
  return res.data; // { success, message, data }
};

/**
 * GET /api/products/:id
 * @param {string} id - Product ID
 */
export const getProductById = async (id) => {
  const res = await axiosInstance.get(`/api/products/${id}`);
  return res.data;
};

/**
 * GET /api/products/:productId/reviews
 * @param {string} productId
 */
export const getProductReviews = async (productId) => {
  const res = await axiosInstance.get(`/api/products/${productId}/reviews`);
  return res.data;
};

// --- Admin endpoints (protected + admin role) ---

/**
 * POST /api/admin/products
 * @param {FormData} formData - Product data including images
 */
export const createProduct = async (formData) => {
  const res = await axiosInstance.post('/api/admin/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * PUT /api/admin/products/:id
 * @param {string} id - Product ID
 * @param {FormData} formData - Updated product data
 */
export const updateProduct = async (id, formData) => {
  const res = await axiosInstance.put(`/api/admin/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/**
 * DELETE /api/admin/products/:id
 * @param {string} id - Product ID
 */
export const deleteProduct = async (id) => {
  const res = await axiosInstance.delete(`/api/admin/products/${id}`);
  return res.data;
};
