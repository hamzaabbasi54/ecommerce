'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCartStore from '@/hooks/useCart';
import useWishlistStore from '@/hooks/useWishlist';

export default function ProductActions({ productId, stock }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, loading, setDrawerOpen } = useCartStore();
  const { wishlist, addItem: addToWishlist, removeItem: removeFromWishlist, loading: wishlistLoading } = useWishlistStore();

  const isInWishlist = wishlist?.some(item => item.product.id === productId);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleIncrease = () => {
    if (quantity < stock) setQuantity(q => q + 1);
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    const result = await addItem(productId, quantity);
    setIsAdding(false);
    if (result) {
      setDrawerOpen(true);
    }
  };

  const handleToggleWishlist = async () => {
    if (isInWishlist) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isOutOfStock = stock < 1;

  return (
    <div className="flex flex-col gap-4 border-t border-border pt-4 mt-2">
      
      <div className="flex items-center gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center border border-gray-200 rounded-sm h-[40px] bg-white">
          <button 
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            className="px-3 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex items-center justify-center disabled:opacity-50 border-r border-gray-200 h-full"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          
          <input 
            type="number" 
            id="quantity"
            name="quantity"
            value={quantity}
            readOnly
            className="w-12 text-sm text-center font-medium border-none focus:ring-0 p-0 text-foreground bg-transparent h-full appearance-none" 
          />
          
          <button 
            onClick={handleIncrease}
            disabled={quantity >= stock || isOutOfStock}
            className="px-3 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors flex items-center justify-center disabled:opacity-50 border-l border-gray-200 h-full"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={handleAddToCart}
          disabled={isAdding || loading || isOutOfStock}
          className="h-[40px] px-6 text-sm font-semibold tracking-wide bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-sm cursor-pointer disabled:cursor-not-allowed"
        >
          {isOutOfStock ? 'Out of Stock' : isAdding ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : 'Add to cart'}
        </Button>
      </div>

      {isOutOfStock && (
        <div className="text-destructive text-xs font-medium mt-1">Currently out of stock</div>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center gap-2 mt-2">
        <button 
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          className={`w-[40px] h-[40px] flex items-center justify-center border transition-colors rounded-sm disabled:opacity-50 bg-white ${
            isInWishlist 
              ? 'border-[#669900] text-[#669900]' 
              : 'border-gray-200 text-gray-500 hover:text-[#669900] hover:border-[#669900]'
          }`}
          title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-[#669900]' : ''}`} />
        </button>
      </div>

    </div>
  );
}
