import { create } from 'zustand';
import * as wishlistService from '@/services/wishlistService';

// Module-level variable to track the latest fetch/mutation sequence.
// This prevents race conditions where a stale initial fetch overwrites an optimistic UI update.
let currentSequenceId = 0;

const useWishlistStore = create((set, get) => ({
  wishlist: null,
  loading: false,
  error: null,

  fetchWishlist: async () => {
    // Capture the sequence ID for this fetch
    const sequenceId = ++currentSequenceId;
    set({ loading: true, error: null });
    
    try {
      const result = await wishlistService.getWishlist();
      
      // ONLY commit the result if no other mutations/fetches have started since we began
      if (result.success && sequenceId === currentSequenceId) {
        set({ wishlist: result.data });
      }
      return result;
    } catch (err) {
      if (sequenceId === currentSequenceId) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch wishlist';
        set({ error: message });
      }
      return null;
    } finally {
      if (sequenceId === currentSequenceId) {
        set({ loading: false });
      }
    }
  },

  addItem: async (productOrId) => {
    const productId = typeof productOrId === 'object' ? productOrId.id : productOrId;
    const product = typeof productOrId === 'object' ? productOrId : { id: productId };
    
    // Invalidate any currently running fetches so they don't overwrite our optimistic state
    ++currentSequenceId;
    
    const previousWishlist = get().wishlist || [];
    
    // Prevent duplicate optimistic entries
    if (previousWishlist.some(item => item.product.id === productId)) {
      return null;
    }
    
    const optimisticItem = {
      id: `temp-${Date.now()}`,
      productId: productId,
      product: product, 
      createdAt: new Date().toISOString()
    };
    
    set({ wishlist: [...previousWishlist, optimisticItem], error: null });

    try {
      const result = await wishlistService.addToWishlist(productId);
      // Sync with real database state silently in background
      get().fetchWishlist(); 
      return result;
    } catch (err) {
      // Revert to previous state if it failed
      ++currentSequenceId; // Invalidate any running fetches
      set({ wishlist: previousWishlist });
      const message = err.response?.data?.message || err.message || 'Failed to add to wishlist';
      set({ error: message });
      return null;
    }
  },

  removeItem: async (productId) => {
    // Invalidate any currently running fetches
    ++currentSequenceId;
    
    const previousWishlist = get().wishlist || [];
    
    // Optimistically filter it out
    set({ 
      wishlist: previousWishlist.filter(item => item.product.id !== productId),
      error: null
    });

    try {
      const result = await wishlistService.removeFromWishlist(productId);
      // Sync with real database state silently in background
      get().fetchWishlist();
      return result;
    } catch (err) {
      // Revert if network fails
      ++currentSequenceId;
      set({ wishlist: previousWishlist });
      const message = err.response?.data?.message || err.message || 'Failed to remove from wishlist';
      set({ error: message });
      return null;
    }
  },
}));

export default useWishlistStore;
