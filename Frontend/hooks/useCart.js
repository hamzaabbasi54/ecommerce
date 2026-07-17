import { create } from 'zustand';
import * as cartService from '@/services/cartService';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,
  isDrawerOpen: false,

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

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
    set({ error: null });
    try {
      const result = await cartService.addToCart({ productId, quantity });
      // Update store directly with populated cart returned from POST
      if (result.success && result.data) {
        set({ cart: result.data });
      }
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add to cart';
      set({ error: message });
      return null;
    }
  },

  updateItem: async (itemId, quantity) => {
    const prevCart = get().cart;

    // Optimistic update — immediately reflect the change in UI
    if (prevCart?.items) {
      const optimisticItems = prevCart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      set({ cart: { ...prevCart, items: optimisticItems } });
    }

    try {
      await cartService.updateCartItem(itemId, quantity);
      return { success: true };
    } catch (err) {
      // Rollback on error
      set({ cart: prevCart, error: err.response?.data?.message || 'Failed to update cart item' });
      return null;
    }
  },

  removeItem: async (itemId) => {
    const prevCart = get().cart;

    // Optimistic update — immediately remove the item from UI
    if (prevCart?.items) {
      const optimisticItems = prevCart.items.filter(item => item.id !== itemId);
      set({ cart: { ...prevCart, items: optimisticItems } });
    }

    try {
      await cartService.removeFromCart(itemId);
      return { success: true };
    } catch (err) {
      // Rollback on error
      set({ cart: prevCart, error: err.response?.data?.message || 'Failed to remove item' });
      return null;
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
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
