import axiosInstance from '@/utils/axiosInstance';

/**
 * Order Service — 1:1 mirror of /api/orders endpoints
 * No logic, no state, no React — just pass params and return response.data
 */

/**
 * POST /api/orders
 * @param {Object} body - { address, email, phone, couponCode, paymentMethod }
 *   address: { firstName, lastName, street, city, province, postalCode, country }
 *   email: required for guest checkout; logged-in users use their account email
 *   phone: optional, stored on order for public lookup
 */
export const createOrder = async ({ address, email, phone, couponCode, paymentMethod }) => {
  const res = await axiosInstance.post('/api/orders', { address, email, phone, couponCode, paymentMethod });
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

/**
 * POST /api/orders/lookup — Public, no authentication required.
 * Look up an order by order ID + email or phone.
 * @param {Object} body - { orderId, email?, phone? }
 */
export const lookupOrder = async ({ orderId, email, phone }) => {
  const res = await axiosInstance.post('/api/orders/lookup', { orderId, email, phone });
  return res.data;
};

/**
 * POST /api/orders/:id/return — Public, no authentication required.
 * Submit a refund or exchange request.
 * @param {string} id - Order ID
 * @param {Object} body - { email?, phone?, type, reason }
 *   type: "refund" or "exchange"
 */
export const requestReturn = async (id, { email, phone, type, reason }) => {
  const res = await axiosInstance.post(`/api/orders/${id}/return`, { email, phone, type, reason });
  return res.data;
};

/**
 * GET /api/orders/match — Authenticated.
 * Returns guest orders whose contactEmail matches the logged-in user's email.
 */
export const getMatchedOrders = async () => {
  const res = await axiosInstance.get('/api/orders/match');
  return res.data;
};

/**
 * POST /api/orders/match — Authenticated.
 * Link a specific matched guest order to the logged-in user's account.
 * @param {string} orderId - The order ID to link
 */
export const linkOrder = async (orderId) => {
  const res = await axiosInstance.post('/api/orders/match', { orderId });
  return res.data;
};

/**
 * POST /api/orders/claim — Authenticated.
 * Manually claim an order by providing its ID + the email or phone used at checkout.
 * @param {Object} body - { orderId, email?, phone? }
 */
export const claimOrder = async ({ orderId, email, phone }) => {
  const res = await axiosInstance.post('/api/orders/claim', { orderId, email, phone });
  return res.data;
};
