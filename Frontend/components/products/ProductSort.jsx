"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function ProductSort({ initialSort = 'newest' }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    
    // Create a new URLSearchParams object from the current ones
    const params = new URLSearchParams(searchParams.toString());
    
    // Update or remove the sort parameter
    if (newSort && newSort !== 'newest') {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    
    // Push the new route, maintaining all other filters
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <label htmlFor="sort" className="text-sm font-medium text-foreground whitespace-nowrap">
        Sort by:
      </label>
      <select 
        id="sort" 
        name="sort"
        defaultValue={initialSort}
        onChange={handleSortChange}
        className="bg-background border border-input text-foreground text-sm rounded-md focus:ring-primary focus:border-primary py-1.5 pl-3 pr-8 cursor-pointer w-full sm:w-auto"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
