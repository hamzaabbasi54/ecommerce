'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const slides = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCE3v_0xCU5GSRrRnnt-vjsm-qoEVV9obrSWnULl07z0MgsG38oFvusXQVIg6vi83T9Cp4QiWlc-QwGkcIwwtUOJQ3_hb1U-nfJ1oNrGML95rQ93JjftAX_al8L2Jimc8_rsTNm0m6uGx9oTdYI1aOMm2Vio6Y22AlieBhVvAT6esB5tz5BHzX5FBasPkhghfBp801shUPky5JvuijS2EqFEvj3UlnIJNe4av5aV1yi9ASxOORjIZdn1A',
  },
  {
    image: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&q=80&w=1600', // Premium gaming/workstation
  },
  {
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1600', // Clean minimalist laptop setup
  },
  {
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1600', // Premium headphones
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[450px] md:h-[520px] bg-surface-container-lowest overflow-hidden flex items-center border-b border-outline-variant">
      
      {/* Background Carousel */}
      <div className="absolute inset-0 w-full h-full bg-[#f8f8f8]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-[-1]'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              className="w-full h-full object-cover object-right-bottom md:object-center" 
              alt="Premium Tech Ecosystem" 
              src={slide.image}
            />
          </div>
        ))}
        {/* Subtle gradient overlay for text readability on all slides */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent z-10"></div>
      </div>
      
      <div className="relative max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop w-full z-20 flex flex-col justify-center">
        <div className="max-w-[42rem]">
          <span className="inline-block py-xs px-sm bg-[#ff4d8d] text-white rounded font-bold text-label-sm mb-md tracking-widest uppercase shadow-sm">
            New Era
          </span>
          <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-foreground mb-lg font-black tracking-tight">
            Next-Gen Tech at Your Fingertips
          </h1>
          <p className="font-body-lg text-body-lg text-muted-foreground mb-xl max-w-[32rem]">
            Experience engineered excellence. Discover our curated collection of premium electronics designed to elevate your digital lifestyle with unparalleled performance and minimalist aesthetics.
          </p>
          <div className="flex gap-md">
            <Link href="/products" className="bg-primary text-primary-foreground font-button text-button py-md px-lg rounded flex items-center gap-sm hover:bg-primary/90 transition-colors">
              Shop Now
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
            <Link href="/categories" className="bg-transparent border border-border text-foreground font-button text-button py-md px-lg rounded hover:bg-surface-container-low transition-colors bg-white/50 backdrop-blur-sm">
              Explore Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Indicators (Dots) */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-primary w-8' : 'bg-primary/30 hover:bg-primary/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </section>
  );
}
