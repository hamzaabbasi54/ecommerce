'use client';

import { useState, useEffect, useCallback } from 'react';
import * as productService from '@/services/productService';

/**
 * useProducts — controller hook for product data.
 * Wraps productService calls with loading/error/data state.
 * Client Component only (uses React state).
 */
export default function useProducts(initialParams = {}) {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch product listing with optional query params
   * @param {Object} params - { page, limit, search, category, brand, minPrice, maxPrice, sort }
   */
  const fetchProducts = useCallback(async (params = initialParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.getProducts(params);
      if (result.success) {
        setProducts(result.data);
      }
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch products';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Fetch a single product by ID
   * @param {string} id
   */
  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await productService.getProductById(id);
      if (result.success) {
        setProduct(result.data);
      }
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch product';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    product,
    loading,
    error,
    fetchProducts,
    fetchProductById,
  };
}
