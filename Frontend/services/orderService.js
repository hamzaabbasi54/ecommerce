import axiosInstance from '@/utils/axiosInstance';

/**
 * Order Service — placeholder for /api/orders endpoints
 * These backend routes don't exist yet (Phase 5 in TASKS.md).
 * Functions are stubbed here so the frontend layer is ready when the backend catches up.
 * No logic, no state, no React.
 */

/**
 * POST /api/orders
 * @param {Object} body - { addressId, couponCode, paymentMethod }
 */
export const createOrder = async ({ addressId, couponCode, paymentMethod }) => {
  const res = await axiosInstance.post('/api/orders', { addressId, couponCode, paymentMethod });
  return res.data; // { success, message, data }
};

/**
 * GET /api/orders
 * @param {Object} params - Query params: { page, limit }
 */
export const getMyOrders = async (params = {}) => {
  const res = await axiosInstance.get('/api/orders', { params });
  return res.data;
};

/**
 * GET /api/orders/:id
 * @param {string} id - Order ID
 */
export const getOrderById = async (id) => {
  const res = await axiosInstance.get(`/api/orders/${id}`);
  return res.data;
};

/**
 * PUT /api/orders/:id/cancel
 * @param {string} id - Order ID
 */
export const cancelOrder = async (id) => {
  const res = await axiosInstance.put(`/api/orders/${id}/cancel`);
  return res.data;
};
