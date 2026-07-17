"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

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
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    // When selecting a specific category, clear brand filter (and vice versa)
    // so the user sees all products for their selection
    if (name === 'category' && value) {
      params.delete('brand');
    } else if (name === 'brand' && value) {
      params.delete('category');
    }
    router.push('/products?' + params.toString());
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

      <Accordion type="multiple" defaultValue={["categories", "brands", "price"]} className="w-full">
        {/* Categories Filter */}
        <AccordionItem value="categories" className="border-b-0">
          <AccordionTrigger className="hover:no-underline py-4 font-medium text-foreground">Categories</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>

        {/* Brands Filter */}
        <AccordionItem value="brands" className="border-b-0 mt-2">
          <AccordionTrigger className="hover:no-underline py-4 font-medium text-foreground">Brands</AccordionTrigger>
          <AccordionContent>
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
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price" className="border-b-0 mt-2">
          <AccordionTrigger className="hover:no-underline py-4 font-medium text-foreground">Price Range</AccordionTrigger>
          <AccordionContent>
            <form onSubmit={applyPriceFilter} className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <label htmlFor="min" className="text-xs text-muted-foreground">Min ($)</label>
                <Input 
                  id="min"
                  type="number" 
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-8 text-sm"
                  min="0"
                />
              </div>
              <div className="space-y-1 flex-1">
                <label htmlFor="max" className="text-xs text-muted-foreground">Max ($)</label>
                <Input 
                  id="max"
                  type="number" 
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-8 text-sm"
                  min="0"
                />
              </div>
              <Button type="submit" size="sm" className="h-8 px-3">
                Apply
              </Button>
            </form>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
