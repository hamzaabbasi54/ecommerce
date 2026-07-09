'use client';

import ProductCard from '@/components/shared/ProductCard';

export default function ProductGrid({ title, products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 border-b border-border pb-4">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div 
              key={product.id}
              className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
              style={{ animationDelay: `${index * 150}ms`, animationDuration: '800ms' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
