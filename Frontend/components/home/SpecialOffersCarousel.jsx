'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useCartStore from '@/hooks/useCart';

export default function SpecialOffersCarousel({ products }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { addItem, setDrawerOpen } = useCartStore();

  useEffect(() => {
    if (!products || products.length === 0 || isPaused) return;
    
    // Auto slide every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [products, isPaused]);

  if (!products || products.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? products.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length);
  };

  const handleBuyNow = async (productId) => {
    const success = await addItem(productId, 1);
    if (success) {
      setDrawerOpen(true);
    }
  };

  const currentProduct = products[currentIndex];
  // Format prices
  const currentPrice = currentProduct.discountPrice ? currentProduct.discountPrice : currentProduct.price;
  const originalPrice = currentProduct.discountPrice ? currentProduct.price : null;

  return (
    <div 
      className="relative w-full bg-[#0063d1] overflow-hidden min-h-[calc(100vh-194px)] flex flex-col justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Huge Background Watermark Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[12vw] font-black text-white/5 whitespace-nowrap tracking-tighter">
          Deal Of The Day
        </h1>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          
          {/* Left Arrow */}
          <button 
            onClick={handlePrevious}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Previous Deal"
          >
            <ArrowLeft className="w-8 h-8 font-light" strokeWidth={1} />
          </button>

          {/* Main Content Area */}
          <div className="flex-1 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16 px-4 md:px-12">
            
            {/* Product Image */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={currentProduct.images?.[0] || 'https://via.placeholder.com/600'} 
                  alt={currentProduct.name}
                  className="w-full h-full object-contain filter drop-shadow-2xl animate-in fade-in zoom-in duration-500 hover:scale-105 transition-transform"
                  key={`img-${currentProduct.id}`}
                />
              </div>
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left text-white" key={`details-${currentProduct.id}`}>
              <span className="text-white/80 text-sm md:text-base font-medium tracking-wide uppercase mb-2 animate-in slide-in-from-right-4 fade-in duration-500 delay-75 fill-mode-both">
                {currentProduct.brand?.name || currentProduct.category?.name || 'Special Offer'}
              </span>
              
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight animate-in slide-in-from-right-4 fade-in duration-500 delay-100 fill-mode-both">
                {currentProduct.name}
              </h2>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mb-10 animate-in slide-in-from-right-4 fade-in duration-500 delay-150 fill-mode-both">
                {originalPrice && (
                  <span className="text-2xl md:text-3xl text-[#FFD200] line-through opacity-80 font-medium">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-3xl md:text-4xl font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-right-4 fade-in duration-500 delay-200 fill-mode-both">
                <Button 
                  onClick={() => handleBuyNow(currentProduct.id)}
                  variant="outline"
                  className="h-12 px-8 bg-transparent border border-white/30 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-md"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
                
                <Link href="/products?onSale=true">
                  <Button 
                    className="h-12 px-8 bg-[#8bc34a] hover:bg-[#7cb342] text-white border-none font-bold uppercase tracking-wider rounded-md w-full sm:w-auto"
                  >
                    View Collections
                  </Button>
                </Link>
              </div>
            </div>

          </div>

          {/* Right Arrow */}
          <button 
            onClick={handleNext}
            className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Next Deal"
          >
            <ArrowRight className="w-8 h-8 font-light" strokeWidth={1} />
          </button>
          
        </div>
      </div>
    </div>
  );
}
