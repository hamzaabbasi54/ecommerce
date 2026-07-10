import { create } from 'zustand';
import * as wishlistService from '@/services/wishlistService';

const useWishlistStore = create((set, get) => ({
  wishlist: null,
  loading: false,
  error: null,

  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const result = await wishlistService.getWishlist();
      if (result.success) {
        set({ wishlist: result.data });
      }
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch wishlist';
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      const result = await wishlistService.addToWishlist(productId);
      // Re-fetch wishlist to get updated state
      await get().fetchWishlist();
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add to wishlist';
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      const result = await wishlistService.removeFromWishlist(productId);
      await get().fetchWishlist();
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to remove from wishlist';
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useWishlistStore;
