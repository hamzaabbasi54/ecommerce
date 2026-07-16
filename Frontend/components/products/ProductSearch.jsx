'use client';
import React from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';

function ProductSearchInner({ variant = 'default' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const [query, setQuery] = useState(currentSearch);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    router.push('/products?' + params.toString());
  };

  const clearSearch = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push('/products?' + params.toString());
  };

  if (variant === 'marketov2') {
    return (
      <form onSubmit={handleSearch} className="flex items-center h-[46px] w-full border border-[#e5e5e5] border-l-0 rounded-r overflow-hidden bg-white">
        <input
          type="text"
          placeholder="Find your product"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 h-full pl-5 pr-4 text-[13px] text-foreground placeholder:text-[#888888] focus:outline-none"
        />

        <button
          type="submit"
          className="h-full px-6 bg-primary hover:bg-[#004ca3] text-white flex items-center justify-center transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>
    );
  }

  // Default variant
  return (
    <form onSubmit={handleSearch} className="relative flex-1 w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search by name, brand, category..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-9 py-2.5 bg-surface-container-low border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

export default function ProductSearch(props) {
  return (
    <React.Suspense fallback={<div className="h-[46px] w-full bg-surface-container-low animate-pulse rounded" />}>
      <ProductSearchInner {...props} />
    </React.Suspense>
  );
}
