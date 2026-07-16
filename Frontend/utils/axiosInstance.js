import axios from 'axios';

const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (JWT + guest_token) on every request
});

// No request interceptor needed — the JWT lives in an httpOnly cookie
// that the browser attaches automatically on same-origin requests.
// The guest_token cookie is also sent automatically via withCredentials.

// Routes that guests can access — never redirect these to /login on 401
const guestAllowedPaths = ['/api/cart', '/api/wishlist', '/api/orders'];

// Response interceptor — handle 401s globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Handle 401 Unauthorized globally (skip for guest-accessible routes)
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      const isGuestRoute = guestAllowedPaths.some((path) => url.startsWith(path));
      if (typeof window !== 'undefined' && !error.config.url.includes('/api/auth/login') && !isGuestRoute) {
        window.location.href = '/login';
      }
    }
    
    // 2. Centralized Error Formatting
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    return Promise.reject(new Error(customMessage));
  }
);

export default axiosInstance;
