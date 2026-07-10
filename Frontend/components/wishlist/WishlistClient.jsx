"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useWishlistStore from '@/hooks/useWishlist';
import useCartStore from '@/hooks/useCart';
import { Loader2 } from 'lucide-react';

export default function WishlistClient() {
  const { wishlist, loading: wishlistLoading, error, fetchWishlist, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [addingToCartId, setAddingToCartId] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId) => {
    await removeItem(productId);
  };

  const handleAddToCart = async (productId) => {
    setAddingToCartId(productId);
    await addToCart(productId, 1);
    await removeItem(productId); // Auto remove from wishlist after adding to cart
    setAddingToCartId(null);
  };

  if (wishlistLoading && !wishlist) {
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
          <h3 className="font-h3 text-h3 text-on-surface mb-sm">Sign in to view your wishlist</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
            Please log in or register to access your saved items.
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

  const items = wishlist || [];
  const isEmpty = items.length === 0;

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="mb-xl">
        <h1 className="font-h1 text-h1 text-on-surface mb-xs">My Wishlist</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Saved for later</p>
      </div>

      {isEmpty ? (
        <div className="border-t border-outline-variant py-xl flex flex-col items-center justify-center text-center mt-xxl">
          <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-4xl text-outline text-[48px]">favorite_border</span>
          </div>
          <h2 className="font-h3 text-h3 text-on-surface mb-sm">Nothing saved yet</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[28rem] mb-lg">
            Your wishlist is currently empty. Explore our latest products and start saving your favorites.
          </p>
          <Link href="/products" className="px-lg h-12 bg-primary-container text-on-primary-container font-button text-button rounded-lg hover:bg-surface-tint transition-colors inline-flex items-center justify-center">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter mb-xxl">
          {items.map((item) => {
            const product = item.product;
            const isAdding = addingToCartId === product.id;

            return (
              <div key={item.id} className="group bg-surface-container-lowest border border-surface-variant rounded-lg overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                <div className="relative h-64 bg-surface-container flex items-center justify-center p-md">
                  <Link href={`/products/${product.slug}`} className="w-full h-full">
                    <img 
                      className="w-full h-full object-contain mix-blend-multiply" 
                      src={product?.images?.[0] || '/placeholder.png'} 
                      alt={product?.name}
                    />
                  </Link>
                  <button 
                    onClick={() => handleRemove(product.id)}
                    disabled={wishlistLoading || isAdding}
                    className="absolute top-md right-md w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                  </button>
                </div>
                <div className="p-lg flex flex-col gap-sm">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest truncate">
                    {product?.brand?.name || 'Brand'}
                  </span>
                  <Link href={`/products/${product.slug}`} className="hover:underline">
                    <h3 className="font-h4 text-h4 text-on-surface line-clamp-1">{product?.name}</h3>
                  </Link>
                  <p className="font-body-lg text-body-lg font-semibold text-on-surface mt-sm">
                    ${product.discountPrice ? product.discountPrice.toFixed(2) : product.price.toFixed(2)}
                  </p>
                  <button 
                    onClick={() => handleAddToCart(product.id)}
                    disabled={isAdding || product?.stock === 0}
                    className="mt-md w-full h-10 border border-primary-container text-primary-container font-button text-button rounded hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {product?.stock === 0 ? 'Out of Stock' : (isAdding ? 'Adding...' : 'Add to Cart')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
