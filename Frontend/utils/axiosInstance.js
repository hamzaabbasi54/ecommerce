import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// No request interceptor needed — the JWT lives in an httpOnly cookie
// that the browser attaches automatically via withCredentials: true.
// JavaScript cannot (and should not) read or set it manually.

// Response interceptor — handle 401s globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // 2. Centralized Error Formatting
    // Extract the exact error message from the backend, or fallback to a standard error.
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    // Reject with a standard Error object so all UI components can just catch `error.message`
    return Promise.reject(new Error(customMessage));
  }
);

export default axiosInstance;

