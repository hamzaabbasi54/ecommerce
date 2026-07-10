'use client';

import { useState } from 'react';

export default function ProductGallery({ images = [], altText = 'Product Image' }) {
  // Use a fallback if no images are provided
  const displayImages = images.length > 0 ? images : ['https://via.placeholder.com/800?text=No+Image'];
  const [mainImage, setMainImage] = useState(displayImages[0]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left-8 duration-700">
      {/* Main Image */}
      <div className="bg-surface-container-low rounded-lg border border-border aspect-square overflow-hidden flex items-center justify-center relative group p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={mainImage} 
          alt={altText} 
          className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" 
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-4 mt-2">
          {displayImages.map((img, index) => (
            <button 
              key={index}
              onClick={() => setMainImage(img)}
              className={`bg-surface-container-low rounded-md overflow-hidden aspect-square flex items-center justify-center p-2 transition-all ${
                mainImage === img 
                  ? 'border-2 border-primary opacity-100 ring-2 ring-primary/20' 
                  : 'border border-border hover:border-outline opacity-60 hover:opacity-100'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img} 
                alt={`${altText} thumbnail ${index + 1}`} 
                className="object-contain w-full h-full mix-blend-multiply" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
