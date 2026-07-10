import Link from 'next/link';

export default function BrandCard({ brand }) {
  // If the brand has a logo, render the image block. 
  // Otherwise, render the minimalist text block.
  
  if (brand.logo) {
    return (
      <Link 
        href={`/products?brand=${brand.slug}`}
        className="bg-surface-container-low border border-border rounded-lg flex items-center justify-center p-8 aspect-square group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_#E5E5E7,0_8px_24px_-4px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_0_1px_#2f3034,0_8px_24px_-4px_rgba(0,0,0,0.2)]"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={brand.logo} 
          alt={brand.name} 
          className="w-full h-full object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
        />
      </Link>
    );
  }

  // Fallback for text-only brand representation
  return (
    <Link 
      href={`/products?brand=${brand.slug}`}
      className="bg-surface-container-low border border-border rounded-lg flex items-center justify-center p-8 aspect-square transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_#E5E5E7,0_8px_24px_-4px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_0_0_1px_#2f3034,0_8px_24px_-4px_rgba(0,0,0,0.2)]"
    >
      <span className="text-xl md:text-2xl font-semibold text-foreground tracking-[0.2em] uppercase text-center line-clamp-2">
        {brand.name}
      </span>
    </Link>
  );
}
