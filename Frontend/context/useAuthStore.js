import { create } from 'zustand';
import { logout as logoutService } from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // Action to set the user (called after successful login/register or profile fetch)
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Action to log the user out
  logout: async () => {
    try {
      // Call the backend to clear the httpOnly cookie
      await logoutService();
    } catch (error) {
      console.error('Logout API failed, proceeding with local logout', error);
    } finally {
      // Clear local state regardless of API success/failure 
      set({ user: null, isAuthenticated: false });
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },
}));

export default useAuthStore;
