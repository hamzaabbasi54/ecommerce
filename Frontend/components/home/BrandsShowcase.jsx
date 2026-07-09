'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

export default function BrandsShowcase({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Our Premium Partners</h2>
          <p className="text-muted-foreground mt-2">Shop top-tier technology from industry leaders.</p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand, index) => (
            <Link key={brand.id} href={`/brands/${brand.slug}`}>
              <Card 
                className="h-32 flex items-center justify-center p-6 bg-surface-container-low border border-border hover:border-primary/50 hover:tech-shadow transition-all duration-300 group cursor-pointer"
              >
                {brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={brand.logoUrl} 
                    alt={brand.name} 
                    className="max-h-full max-w-full object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <span className="font-bold text-lg tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
                    {brand.name.toUpperCase()}
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
