"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductSort({ initialSort = 'newest' }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort) => {
    
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
      <Select defaultValue={initialSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort" className="w-full sm:w-[180px] bg-background">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="price_asc">Price: Low to High</SelectItem>
          <SelectItem value="price_desc">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
