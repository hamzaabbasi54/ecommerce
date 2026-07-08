import axiosInstance from '@/utils/axiosInstance';

/**
 * Auth Service — 1:1 mirror of /api/auth endpoints
 * No logic, no state, no React — just pass params and return response.data
 */

/** POST /api/auth/register */
export const register = async ({ name, email, password, phone }) => {
  const res = await axiosInstance.post('/api/auth/register', { name, email, password, phone });
  return res.data; // { success, message, data }
};

/** POST /api/auth/login */
export const login = async ({ email, password }) => {
  const res = await axiosInstance.post('/api/auth/login', { email, password });
  return res.data;
};

/** POST /api/auth/logout */
export const logout = async () => {
  const res = await axiosInstance.post('/api/auth/logout');
  return res.data;
};

/** POST /api/auth/forgotpassword */
export const forgotPassword = async ({ email }) => {
  const res = await axiosInstance.post('/api/auth/forgotpassword', { email });
  return res.data;
};

/** PUT /api/auth/resetpassword/:resetToken */
export const resetPassword = async (resetToken, { password }) => {
  const res = await axiosInstance.put(`/api/auth/resetpassword/${resetToken}`, { password });
  return res.data;
};

/** PUT /api/auth/changepassword (protected) */
export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await axiosInstance.put('/api/auth/changepassword', { currentPassword, newPassword });
  return res.data;
};
