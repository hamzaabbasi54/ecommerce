"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import useWishlistStore from '@/hooks/useWishlist';
import useCartStore from '@/hooks/useCart';
import { Loader2, X, CheckCircle } from 'lucide-react';

export default function WishlistClient() {
  const { wishlist, loading: wishlistLoading, error, fetchWishlist, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("Product added to cart successfully");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  if (wishlistLoading && !wishlist) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle Unauthorized (Guest) or generic errors
  if (error === 'Not authenticated' || error === 'Unauthorized' || error?.toLowerCase().includes('unauthorized') || error?.toLowerCase().includes('token')) {
    return (
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-16">
        <div className="mt-16 text-center max-w-[32rem] mx-auto">
          <div className="w-24 h-24 mx-auto bg-[#f8f8f8] rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-muted-foreground">lock</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Sign in to view your wishlist</h3>
          <p className="text-muted-foreground mb-8">
            Please log in or register to access your saved items.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="px-8 py-3 bg-primary text-white font-bold rounded hover:bg-primary/90 transition-colors inline-flex items-center justify-center">
              Sign In
            </Link>
            <Link href="/register" className="px-8 py-3 border border-border text-foreground font-bold rounded hover:bg-[#f8f8f8] transition-colors inline-flex items-center justify-center">
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
    <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-16 bg-white">
      
      {successMessage && (
        <div className="border-t-[3px] border-[#81d742] bg-[#f7f6f7] p-4 mb-8 flex items-center gap-2 text-[15px] text-[#515151]">
          <CheckCircle className="text-[#81d742] w-5 h-5" /> {successMessage}
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-[32px] font-medium text-foreground mb-4">
          My wishlist on MarketPress
        </h1>
      </div>

      <div className="w-full overflow-x-auto border border-[#e5e5e5] rounded-sm mb-16">
        <table className="w-full text-center text-[13px] border-collapse">
          <thead className="bg-white border-b border-[#e5e5e5]">
            <tr>
              <th className="py-4 px-4 font-bold text-foreground border-r border-[#e5e5e5] w-12"></th>
              <th className="py-4 px-4 font-bold text-foreground border-r border-[#e5e5e5] w-48"></th>
              <th className="py-4 px-4 font-bold text-foreground border-r border-[#e5e5e5]">Product name</th>
              <th className="py-4 px-4 font-bold text-foreground border-r border-[#e5e5e5]">Unit price</th>
              <th className="py-4 px-4 font-bold text-foreground border-r border-[#e5e5e5]">Stock status</th>
              <th className="py-4 px-4 font-bold text-foreground"></th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isEmpty ? (
              <tr>
                <td colSpan="6" className="py-6 px-4 text-left text-[#515151]">
                  No products added to the wishlist
                  <div className="mt-4">
                    <Link href="/products" className="px-6 py-2 bg-[#0063d1] text-white rounded text-[13px] font-bold hover:bg-[#004ca3] transition-colors inline-block">
                      Browse Products
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const product = item.product;
                const isAdding = addingToCartId === product.id;
                const price = product.discountPrice ? product.discountPrice : product.price;

                return (
                  <tr key={item.id} className="border-b border-[#e5e5e5] last:border-b-0">
                    
                    {/* Remove Icon */}
                    <td className="py-6 px-4 border-r border-[#e5e5e5] align-middle">
                      <button 
                        onClick={() => handleRemove(product.id)}
                        disabled={wishlistLoading || isAdding}
                        className="text-red-500 hover:text-red-700 font-bold text-lg disabled:opacity-50 mx-auto block"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </td>
                    
                    {/* Product Image */}
                    <td className="py-6 px-4 border-r border-[#e5e5e5] align-middle">
                      <Link href={`/products/${product.slug}`} className="block w-32 h-32 mx-auto">
                        <img 
                          src={product?.images?.[0] || '/placeholder.png'} 
                          alt={product?.name}
                          className="w-full h-full object-contain"
                        />
                      </Link>
                    </td>
                    
                    {/* Product Name */}
                    <td className="py-6 px-4 border-r border-[#e5e5e5] align-middle">
                      <Link href={`/products/${product.slug}`} className="text-[#0063d1] hover:underline">
                        {product?.name}
                      </Link>
                    </td>
                    
                    {/* Unit Price */}
                    <td className="py-6 px-4 border-r border-[#e5e5e5] align-middle">
                      <span className="text-[#66ad00]">${price.toFixed(2)}</span>
                    </td>
                    
                    {/* Stock Status */}
                    <td className="py-6 px-4 border-r border-[#e5e5e5] align-middle text-muted-foreground">
                      {product?.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </td>
                    
                    {/* Action */}
                    <td className="py-6 px-4 align-middle">
                      <button 
                        onClick={() => handleAddToCart(product.id)}
                        disabled={isAdding || product?.stock === 0}
                        className="text-[#0063d1] hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                         {isAdding ? 'Adding...' : 'Add to Cart'}
                      </button>
                    </td>
                    
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
