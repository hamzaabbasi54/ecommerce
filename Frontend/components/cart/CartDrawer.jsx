'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCartStore from '@/hooks/useCart';

export default function CartDrawer() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const {
    cart,
    loading,
    isDrawerOpen,
    setDrawerOpen,
    fetchCart,
    updateItem,
    removeItem,
  } = useCartStore();

  // Only render portal after hydration is complete
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch cart when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      fetchCart();
    }
  }, [isDrawerOpen, fetchCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    if (isDrawerOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isDrawerOpen, setDrawerOpen]);

  const cartItems = cart?.items || [];
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.quantity * item.priceAtAdd), 0);

  const handleQuantityChange = async (itemId, newQuantity, stock) => {
    if (newQuantity < 1 || newQuantity > stock) return;
    await updateItem(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    await removeItem(itemId);
  };

  const handleCheckout = () => {
    setDrawerOpen(false);
    router.push('/checkout');
  };

  const handleViewCart = () => {
    setDrawerOpen(false);
    router.push('/cart');
  };

  // Don't render portal until after hydration
  if (!mounted) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[9998] bg-black/50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{ transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)' }}
        className="fixed inset-y-0 right-0 z-[9999] w-full sm:max-w-[28rem] bg-background border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 shrink-0">
          <h2 className="text-[16px] font-bold text-foreground">Shopping cart</h2>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-6 h-6 flex items-center justify-center bg-[#f1f1f1] rounded-full hover:bg-[#e5e5e5] transition-colors"
            aria-label="Close cart"
          >
            <X className="h-4 w-4 text-foreground font-bold" />
          </button>
        </div>

        {/* Cart Items — scrollable area */}
        <div className="flex-1 overflow-y-auto px-6">
          {loading && cartItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Add items to get started
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setDrawerOpen(false);
                  router.push('/products');
                }}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[#e5e5e5] mt-4">
              {cartItems.map((item) => {
                const product = item.product;
                return (
                  <div key={item.id} className="py-4 flex gap-4 items-center">
                    {/* Product Image */}
                    <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product?.images?.[0] || '/placeholder.png'}
                        alt={product?.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <Link href={`/products/${product?.slug}`} className="text-[13px] text-[#0063d1] hover:underline line-clamp-1">
                          {product?.name}
                        </Link>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={loading}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors disabled:opacity-40"
                          aria-label={`Remove ${product?.name}`}
                        >
                          <X className="h-3 w-3 font-bold" strokeWidth={3} />
                        </button>
                      </div>

                      <div className="text-[13px] text-foreground mt-1 text-right pr-6">
                        {item.quantity} x <span className="text-[#66ad00]">${(item.priceAtAdd).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
          <div className="p-6 shrink-0">
            {/* Subtotal */}
            <div className="flex items-center justify-end text-[14px] font-bold text-foreground mb-6">
              <span className="mr-2">Subtotal:</span>
              <span className="text-[#66ad00]">${subtotal.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleViewCart}
                className="flex-1 h-10 bg-[#0063d1] text-white rounded-full text-[13px] font-bold hover:bg-[#004ca3] transition-colors"
              >
                View cart
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 h-10 bg-[#0063d1] text-white rounded-full text-[13px] font-bold hover:bg-[#004ca3] transition-colors"
              >
                Checkout
              </button>
            </div>
          </div>
      </div>
    </>,
    document.body
  );
}
