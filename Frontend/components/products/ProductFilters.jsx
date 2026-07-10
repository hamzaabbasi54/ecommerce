"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProductFilters({ categories, brands }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const currentCategory = searchParams.get('category');
  const currentBrand = searchParams.get('brand');
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  // Local state for price inputs to allow typing before applying
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  // Helper to update query string
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const applyFilter = (name, value) => {
    router.push('/products?' + createQueryString(name, value));
  };

  const applyPriceFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    router.push('/products?' + params.toString());
  };

  const clearFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters = currentCategory || currentBrand || currentMinPrice || currentMaxPrice;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Filters</h2>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="text-sm text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Categories Filter */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Categories</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => applyFilter('category', null)}
              className={`text-sm hover:text-primary transition-colors ${!currentCategory ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              All Categories
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => applyFilter('category', category.slug)}
                className={`text-sm hover:text-primary transition-colors ${currentCategory === category.slug ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands Filter */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Brands</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => applyFilter('brand', null)}
              className={`text-sm hover:text-primary transition-colors ${!currentBrand ? 'text-primary font-medium' : 'text-muted-foreground'}`}
            >
              All Brands
            </button>
          </li>
          {brands.map((brand) => (
            <li key={brand.id}>
              <button
                onClick={() => applyFilter('brand', brand.slug)}
                className={`text-sm hover:text-primary transition-colors ${currentBrand === brand.slug ? 'text-primary font-medium' : 'text-muted-foreground'}`}
              >
                {brand.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Price Range</h3>
        <form onSubmit={applyPriceFilter} className="flex items-end gap-2">
          <div className="space-y-1 flex-1">
            <label htmlFor="min" className="text-xs text-muted-foreground">Min ($)</label>
            <Input 
              id="min"
              type="number" 
              placeholder="0" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1 flex-1">
            <label htmlFor="max" className="text-xs text-muted-foreground">Max ($)</label>
            <Input 
              id="max"
              type="number" 
              placeholder="Max" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-9"
            />
          </div>
          <Button type="submit" size="sm" className="h-9 px-3">
            Go
          </Button>
        </form>
      </div>
    </div>
  );
}
