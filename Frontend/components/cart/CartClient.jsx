"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import useCartStore from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';

export default function CartClient() {
  const { cart, loading, error, fetchCart, updateItem, removeItem } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateItem(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    await removeItem(itemId);
  };

  if (loading && !cart) {
    return (
      <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle Unauthorized (Guest) or generic errors
  if (error === 'Not authenticated' || error === 'Unauthorized' || error?.toLowerCase().includes('unauthorized') || error?.toLowerCase().includes('token')) {
    return (
      <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl">
        <div className="mt-xxl pt-xl text-center max-w-[32rem] mx-auto">
          <div className="w-24 h-24 mx-auto bg-surface-container rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-[40px] text-outline">lock</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-sm">Sign in to view your cart</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
            Please log in or register to access your shopping cart and saved items.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="px-lg h-12 bg-primary text-on-primary font-button text-button rounded-lg hover:bg-surface-tint transition-colors inline-flex items-center justify-center">
              Sign In
            </Link>
            <Link href="/register" className="px-lg h-12 border border-outline-variant text-on-surface font-button text-button rounded-lg hover:bg-surface-variant transition-colors inline-flex items-center justify-center">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const isEmpty = cartItems.length === 0;

  // Calculate totals
  const subtotal = cartItems.reduce((acc, item) => acc + (item.quantity * item.priceAtAdd), 0);
  const taxRate = 0.07; // 7% dummy tax rate
  const estimatedTax = subtotal * taxRate;
  const total = subtotal + estimatedTax;

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="mb-lg">
        <h1 className="font-h2 text-h2 text-on-surface">Your Cart</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {isEmpty ? (
        <div className="mt-xxl pt-xl border-t border-surface-variant text-center max-w-[32rem] mx-auto">
          <div className="w-24 h-24 mx-auto bg-surface-container rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-[40px] text-outline">shopping_cart</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-sm">Your cart is empty</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
            Looks like you haven't added anything to your cart yet. Discover our latest engineered excellence.
          </p>
          <Link href="/products" className="px-lg h-12 border border-outline-variant text-on-surface font-button text-button rounded-lg hover:bg-surface-variant transition-colors inline-flex items-center justify-center">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter relative items-start">
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-8 flex flex-col gap-0">
            {cartItems.map((item) => {
              const product = item.product;
              return (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center py-lg border-b border-surface-variant gap-md">
                  <div className="w-24 h-24 shrink-0 bg-surface-container-lowest rounded-lg border border-surface-variant overflow-hidden flex items-center justify-center p-sm">
                    <img 
                      className="w-full h-full object-contain" 
                      src={product?.images?.[0] || '/placeholder.png'} 
                      alt={product?.name}
                    />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <Link href={`/products/${product?.slug}`} className="hover:underline">
                      <h3 className="font-h4 text-h4 text-on-surface">{product?.name}</h3>
                    </Link>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-unit uppercase tracking-wider">
                      {product?.brand?.name || 'Brand'}
                    </p>
                  </div>
                  <div className="flex items-center gap-lg w-full sm:w-auto justify-between sm:justify-end mt-md sm:mt-0">
                    <div className="flex items-center border border-outline-variant rounded-full h-10 px-xs">
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-variant disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">remove</span>
                      </button>
                      <span className="font-body-md text-body-md w-8 text-center text-on-surface font-medium">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-variant disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                      </button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-body-lg text-body-lg font-bold text-on-surface">
                        ${item.priceAtAdd.toFixed(2)}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      disabled={loading}
                      className="text-on-surface-variant hover:text-error transition-colors p-sm disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 mt-lg lg:mt-0 lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-lg shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <h2 className="font-h3 text-h3 text-on-surface mb-md">Order Summary</h2>
              <div className="flex flex-col gap-sm border-b border-surface-variant pb-md mb-md">
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Subtotal</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Shipping</span>
                  <span className="font-body-md text-body-md text-on-surface-variant italic text-[14px]">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Estimated Tax</span>
                  <span className="font-body-md text-body-md text-on-surface font-medium">${estimatedTax.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mb-lg">
                <span className="font-h4 text-h4 text-on-surface">Total</span>
                <span className="font-h2 text-h2 text-on-surface tracking-tight">${total.toFixed(2)}</span>
              </div>
              <Link 
                href={loading ? "#" : "/checkout"}
                className={`w-full bg-primary-container text-on-primary-container font-button text-button h-12 rounded-lg flex items-center justify-center hover:bg-surface-tint transition-colors ${loading ? 'opacity-75 pointer-events-none' : ''}`}
              >
                Proceed to Checkout
              </Link>
              <Link href="/products" className="w-full mt-md flex items-center justify-center gap-sm text-primary font-button text-button hover:text-surface-tint transition-colors group">
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
