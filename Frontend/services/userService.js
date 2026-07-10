import axiosInstance from '@/utils/axiosInstance';

// Profile
export const getProfile = async () => {
  const res = await axiosInstance.get('/api/user/profile');
  return res.data;
};

export const updateProfile = async (data) => {
  const isFormData = data instanceof FormData;
  const res = await axiosInstance.put('/api/user/profile', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : { 'Content-Type': 'application/json' }
  });
  return res.data;
};

// Security
export const updatePassword = async (data) => {
  const res = await axiosInstance.put('/api/user/security', data);
  return res.data;
};

// Addresses
export const getAddresses = async () => {
  const res = await axiosInstance.get('/api/user/addresses');
  return res.data;
};

export const createAddress = async (data) => {
  const res = await axiosInstance.post('/api/user/addresses', data);
  return res.data;
};

export const updateAddress = async (id, data) => {
  const res = await axiosInstance.put(`/api/user/addresses/${id}`, data);
  return res.data;
};

export const deleteAddress = async (id) => {
  const res = await axiosInstance.delete(`/api/user/addresses/${id}`);
  return res.data;
};
