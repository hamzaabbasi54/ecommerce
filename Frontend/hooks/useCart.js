'use client';

import { useState, useCallback } from 'react';
import * as cartService from '@/services/cartService';

/**
 * useCart — controller hook for cart operations.
 * Wraps cartService calls with loading/error/data state.
 * Client Component only (uses React state).
 */
export default function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Fetch the current user's cart */
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await cartService.getCart();
      if (result.success) {
        setCart(result.data);
      }
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch cart';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add a product to cart
   * @param {string} productId
   * @param {number} quantity
   */
  const addItem = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cartService.addToCart({ productId, quantity });
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add to cart';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a cart item's quantity
   * @param {string} itemId - CartItem ID
   * @param {number} quantity
   */
  const updateItem = useCallback(async (itemId, quantity) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cartService.updateCartItem(itemId, quantity);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update cart item';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove an item from the cart
   * @param {string} itemId - CartItem ID
   */
  const removeItem = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cartService.removeFromCart(itemId);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to remove item';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
  };
}
