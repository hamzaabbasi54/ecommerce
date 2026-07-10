'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingBag, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCartStore from '@/hooks/useCart';
import useWishlistStore from '@/hooks/useWishlist';

export default function ProductActions({ productId, stock }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, loading } = useCartStore();
  const { addItem: addToWishlist, loading: wishlistLoading } = useWishlistStore();

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  const handleIncrease = () => {
    if (quantity < stock) setQuantity(q => q + 1);
  };

  const handleAddToCart = async () => {
    await addItem(productId, quantity);
  };

  const handleAddToWishlist = async () => {
    await addToWishlist(productId);
  };

  const isOutOfStock = stock < 1;

  return (
    <div className="flex flex-col gap-6 border-t border-border pt-8 mt-8">
      
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="sr-only">Quantity</label>
        <div className="flex items-center border border-input rounded-md h-[48px] bg-background">
          <button 
            onClick={handleDecrease}
            disabled={quantity <= 1 || isOutOfStock}
            className="px-4 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          
          <input 
            type="number" 
            id="quantity"
            name="quantity"
            value={quantity}
            readOnly
            className="w-12 text-center font-medium border-none focus:ring-0 p-0 text-foreground bg-transparent h-full appearance-none" 
          />
          
          <button 
            onClick={handleIncrease}
            disabled={quantity >= stock || isOutOfStock}
            className="px-4 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {isOutOfStock && (
          <span className="text-destructive text-sm font-medium">Currently out of stock</span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleAddToCart}
          disabled={loading || isOutOfStock}
          className="flex-1 h-[48px] text-base font-semibold tracking-wide flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-5 w-5" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        
        <Button 
          onClick={handleAddToWishlist}
          disabled={wishlistLoading}
          variant="outline"
          className="h-[48px] px-8 text-base font-semibold flex items-center justify-center gap-2 hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
        >
          <Heart className="h-5 w-5" />
          {wishlistLoading ? 'Adding...' : 'Add to Wishlist'}
        </Button>
      </div>

    </div>
  );
}
