'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import useCartStore from '@/hooks/useCart';

export default function ProductCard({ product }) {
  const { addItem, loading } = useCartStore();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id, 1);
  };

  // Format prices safely
  const currentPrice = product.discountPrice ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice ? product.price : null;

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <Card className="h-full border border-border bg-card hover:tech-shadow transition-shadow duration-300 flex flex-col overflow-hidden rounded-md">
        
        {/* Image Container */}
        <div className="relative aspect-square w-full bg-surface-container-low flex items-center justify-center p-6 overflow-hidden">
          {product.discountPrice && (
            <Badge className="absolute top-3 left-3 bg-destructive text-on-error hover:bg-destructive/90 z-10 rounded-sm">
              Sale
            </Badge>
          )}
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
            <span className="text-lg font-bold text-foreground">
              ${currentPrice?.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${originalPrice?.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>

        {/* Footer Actions */}
        <CardFooter className="p-4 pt-0">
          <Button 
            variant="secondary" 
            className="w-full bg-surface-container-high hover:bg-primary hover:text-on-primary transition-colors duration-300 border-none"
            onClick={handleAddToCart}
            disabled={loading || product.stock < 1}
          >
            {product.stock < 1 ? (
              'Out of Stock'
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
