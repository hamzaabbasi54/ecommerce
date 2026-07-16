'use client';

import { useState } from 'react';

export default function ProductTabs({ description, reviewsComponent }) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="mt-12 max-w-[1280px] mx-auto w-full px-4 md:px-8">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('description')}
          className={`py-3 px-6 text-sm font-semibold transition-colors ${
            activeTab === 'description' 
              ? 'border-b-2 border-[#0066cc] text-[#0066cc]' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-3 px-6 text-sm font-semibold transition-colors ${
            activeTab === 'reviews' 
              ? 'border-b-2 border-[#0066cc] text-[#0066cc]' 
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Reviews
        </button>
      </div>

      <div className="border border-gray-200 border-t-0 p-6 md:p-10 bg-white min-h-[300px]">
        {activeTab === 'description' ? (
          <div className="text-sm text-gray-600 leading-relaxed max-w-none whitespace-pre-wrap">
            {description}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {reviewsComponent}
          </div>
        )}
      </div>
    </div>
  );
}
