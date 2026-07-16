import { create } from 'zustand';
import { logout as logoutService } from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // Action to set the user (called after successful login/register or profile fetch)
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Initialize auth state on mount by hitting the profile endpoint
  initialize: async () => {
    try {
      // Inline fetch to avoid circular dependencies or missing services
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          set({ user: data.data, isAuthenticated: true });
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth', error);
    }
  },

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
      
      // We no longer redirect to /login to allow the user to stay on the current page
    }
  },
}));

export default useAuthStore;
