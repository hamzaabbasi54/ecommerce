'use client';

import { useState } from 'react';

export default function ProductGallery({ images = [], altText = 'Product Image' }) {
  // Use a fallback if no images are provided
  const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/800?text=No+Image'];
  const [mainImage, setMainImage] = useState(displayImages[0]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-8 duration-700">
      {/* Main Image */}
      <div className="bg-white rounded-lg h-[250px] md:h-[350px] flex items-center justify-center relative group p-4">
        {/* Sale Badge */}
        <div className="absolute top-4 left-4 bg-[#669900] text-white text-xs font-bold w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-sm">
          Sale!
        </div>
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={mainImage} 
          alt={altText} 
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500" 
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-4 mt-4 overflow-x-auto pb-1 px-4">
          {displayImages.map((img, index) => (
            <button 
              key={index}
              onClick={() => setMainImage(img)}
              className={`bg-white overflow-hidden w-20 h-20 shrink-0 flex items-center justify-center p-2 transition-all border ${
                mainImage === img 
                  ? 'border-[#0066cc] opacity-100' 
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-gray-200'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img} 
                alt={`${altText} thumbnail ${index + 1}`} 
                className="object-contain w-full h-full" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
