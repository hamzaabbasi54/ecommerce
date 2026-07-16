'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ShoppingBag, Heart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useCartStore from '@/hooks/useCart';
import useWishlistStore from '@/hooks/useWishlist';

export default function ProductCard({ product }) {
  const { addItem, loading, setDrawerOpen } = useCartStore();
  const { wishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const [isAdding, setIsAdding] = useState(false);

  const inWishlist = wishlist?.some(item => item.product?.id === product.id) || false;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    const result = await addItem(product.id, 1);
    setIsAdding(false);
    if (result) {
      setDrawerOpen(true);
    }
  };

  // Format prices safely
  const currentPrice = product.discountPrice ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice ? product.price : null;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <Card className="h-full border border-[#E5E5E5] bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:border-transparent transition-all duration-300 flex flex-col overflow-hidden rounded-xl">

        {/* Image Container */}
        <div className="relative h-[220px] w-full bg-[#f8f8f8] flex items-center justify-center p-6 overflow-hidden">
          {product.discountPrice && (
            <Badge className="absolute top-3 left-3 bg-[#FFD200] text-black hover:bg-[#FFD200]/90 z-10 rounded shadow-sm font-bold tracking-wider uppercase text-[10px]">
              Sale
            </Badge>
          )}
          
          {/* Wishlist Button */}
          <button 
            onClick={async (e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              if (inWishlist) {
                await removeFromWishlist(product.id);
              } else {
                await addToWishlist(product);
              }
            }}
            className={`absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 z-10 ${
              inWishlist 
                ? 'text-red-500 opacity-100 translate-x-0' 
                : 'text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0'
            }`}
          >
            <Heart size={16} className={inWishlist ? "fill-current" : ""} />
          </button>

          {/* We're using a standard img tag here, but in Next.js next/image is better for performance. We'd use next/image if we had configured domains. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400?text=Product'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <CardContent className="p-4 flex-grow flex flex-col gap-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {product.brand?.name || 'Electronica'}
          </div>
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
            {product.name}
          </h3>
          <div className="mt-auto pt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#3b6a00]">
              ${currentPrice?.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through font-medium">
                ${originalPrice?.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="p-4">
          <Button
            variant="default"
            className="w-full bg-[#0063d1] hover:bg-[#004ca3] text-white transition-colors duration-300 border-none rounded-lg uppercase tracking-wider text-xs font-bold cursor-pointer disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={isAdding || loading || product.stock < 1}
          >
            {product.stock < 1 ? (
              'Out of Stock'
            ) : isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <ShoppingBag className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
