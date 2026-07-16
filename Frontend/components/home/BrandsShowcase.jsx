'use client';

import Link from 'next/link';
import { useRef } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function BrandsShowcase({ brands }) {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  if (!brands || brands.length === 0) return null;

  // Helper to provide rich content for the brands
  const getBrandDetails = (name) => {
    const details = {
      'Apple': { desc: 'Experience the pinnacle of innovation, premium design, and seamless ecosystem integration across all your devices.', img: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&q=80&w=600' },
      'Logitech': { desc: 'Precision-engineered peripherals and accessories designed for ultimate productivity, creation, and gaming.', img: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600' },
      'Samsung': { desc: 'Cutting-edge displays, smart devices, and components powering the next generation of consumer technology.', img: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=600' },
      'Sony': { desc: 'Unrivaled audio fidelity, legendary gaming consoles, and visual electronics crafted for the ultimate sensory experience.', img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=600' },
    };
    return details[name] || { desc: 'Discover premium quality and unparalleled performance from this industry-leading technology partner.', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600' };
  };

  // Determine how many items to show based on standard breakpoints
  // We'll use CSS to handle width (100% on mobile, 50% on tablet, 33.333% on desktop)
  
  return (
    <section className="py-20 bg-[#fcf9f8] border-t border-[#e5e5e5]">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="text-primary text-[15px] font-medium tracking-wide">Industry Leaders</span>
          <h2 className="text-[32px] md:text-[40px] font-black text-foreground tracking-tight leading-tight mt-1">
            Our Premium Partners
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="w-full relative px-12 pb-4">
          <Carousel
            plugins={[plugin.current]}
            opts={{
              align: "start",
              loop: true,
            }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {[...brands, ...brands, ...brands].map((brand, index) => {
                const details = getBrandDetails(brand.name);
                return (
                  <CarouselItem 
                    key={`${brand.id || 'brand'}-${index}`} 
                    className="pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="bg-white rounded-2xl border border-[#e5e5e5] h-[360px] flex flex-col overflow-hidden hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                      
                      {/* Top Image Banner */}
                      <div className="h-[140px] w-full overflow-hidden relative bg-surface-container-low">
                        <img 
                          src={details.img} 
                          alt={`${brand.name} products`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>

                      {/* Content */}
                      <div className="p-6 relative flex flex-col flex-grow">
                        {/* Logo or Name Badge pushing up into the image */}
                        <div className="absolute -top-10 left-6 w-16 h-16 bg-white rounded-xl shadow-md border border-[#e5e5e5] flex items-center justify-center p-2">
                          {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain" />
                          ) : (
                            <span className="font-black text-primary text-xl">{brand.name.charAt(0)}</span>
                          )}
                        </div>

                        <div className="mt-8 flex-grow">
                          <h3 className="text-xl font-black text-foreground mb-2">{brand.name}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                            {details.desc}
                          </p>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-[#e5e5e5]">
                          <Link href={`/products?brand=${brand.slug}`} className="text-primary text-xs font-bold uppercase tracking-wider hover:underline underline-offset-4 cursor-pointer inline-block">
                            Explore Products
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

      </div>
    </section>
  );
}
