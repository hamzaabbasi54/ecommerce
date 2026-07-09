import axios from 'axios';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// No request interceptor needed — the JWT lives in an httpOnly cookie
// that the browser attaches automatically on same-origin requests.

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
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    return Promise.reject(new Error(customMessage));
  }
);

export default axiosInstance;
