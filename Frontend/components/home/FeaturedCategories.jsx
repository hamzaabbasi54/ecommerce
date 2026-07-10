'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function FeaturedCategories({ categories }) {
  if (!categories || categories.length === 0) return null;

  // Ideally, the first category is large (e.g., Audio), next two are smaller (e.g., Peripherals, Components)
  const mainCategory = categories[0];
  const subCategories = categories.slice(1, 3);

  // Fallback images matching the design aesthetic if no image is present
  const fallbacks = [
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600', // Headphones
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400', // Keyboard
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400'  // Circuit board
  ];

  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-border pb-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Browse by Category</h2>
            <p className="text-muted-foreground mt-2">Precision-engineered hardware for every workflow.</p>
          </div>
          <Link href="/categories" className="hidden md:flex items-center text-sm font-semibold text-primary hover:text-primary-container transition-colors group">
            View All Categories
            <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* CSS Grid matching the Stitch design (1 large left, 2 stacked right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[240px] lg:auto-rows-[300px]">
          
          {/* Main Large Category */}
          {mainCategory && (
            <Link 
              href={`/products?category=${mainCategory.slug}`} 
              className="lg:col-span-2 lg:row-span-2 group relative overflow-hidden rounded-md bg-surface-container-low border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={mainCategory.imageUrl || fallbacks[0]} 
                alt={mainCategory.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{mainCategory.name}</h3>
                <p className="text-white/80 max-w-sm hidden md:block">
                  {mainCategory.description || 'Studio-grade sound reproduction.'}
                </p>
              </div>
            </Link>
          )}

          {/* Sub Categories Stacked */}
          <div className="flex flex-col gap-6 lg:row-span-2 h-full">
            {subCategories.map((cat, index) => (
              <Link 
                key={cat.id}
                href={`/products?category=${cat.slug}`} 
                className="group relative flex-1 overflow-hidden rounded-md bg-surface-container-low border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={cat.imageUrl || fallbacks[index + 1]} 
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-xl font-bold text-white">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>

        </div>
        
        {/* Mobile View All Link */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/categories" className="inline-flex items-center text-sm font-semibold text-primary">
            View All Categories
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
