import { create } from 'zustand';
import * as cartService from '@/services/cartService';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const result = await cartService.getCart();
      if (result.success) {
        set({ cart: result.data });
      }
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch cart';
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const result = await cartService.addToCart({ productId, quantity });
      // Re-fetch cart to get updated state
      await get().fetchCart();
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add to cart';
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ loading: true, error: null });
    try {
      const result = await cartService.updateCartItem(itemId, quantity);
      await get().fetchCart();
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update cart item';
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ loading: true, error: null });
    try {
      const result = await cartService.removeFromCart(itemId);
      await get().fetchCart();
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to remove item';
      set({ error: message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      // Since the backend order creation already clears the cart items in the database,
      // we just need to re-fetch the cart to sync our local state, or reset it directly.
      await get().fetchCart();
      return { success: true };
    } catch (err) {
      set({ error: 'Failed to clear cart state' });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCartStore;
