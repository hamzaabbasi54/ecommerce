'use client';

import Link from 'next/link';

export default function FeaturedCategories({ categories }) {
  if (!categories || categories.length === 0) return null;

  // We need at least 1 category for the left panel.
  // The right panel uses up to 3 more.
  const mainCategory = categories[0];
  const subCategories = categories.slice(1, 4); // Take up to 3 for the right boxes

  // Fallback images matching the design aesthetic if no image is present
  const fallbacks = [
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600', // Headphones (Main)
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=400', // Keyboard (Sub 1)
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400', // Circuit board (Sub 2)
    'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=400'  // Smartphone (Sub 3)
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="mb-10">
          <span className="text-primary text-[15px] font-medium tracking-wide">Electronica Collections</span>
          <h2 className="text-[32px] md:text-[40px] font-black text-foreground tracking-tight leading-tight mt-1">
            Browse by Category
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Left Large Column (Main Category) */}
          <Link href={`/products?category=${mainCategory.slug}`} className="group relative bg-[#f1f1f1] rounded-2xl h-[380px] md:h-[420px] p-6 md:p-8 flex flex-col items-center overflow-hidden transition-all duration-300">
            <div className="text-center relative z-10">
              <span className="text-primary text-[13px] md:text-[14px] font-medium tracking-wide">Featured Category</span>
              <h3 className="text-[28px] md:text-[32px] font-black text-foreground mt-1 tracking-tight group-hover:text-primary transition-colors">
                {mainCategory.name}
              </h3>
            </div>
            
            <div className="relative mt-auto w-[85%] h-[65%] flex items-end justify-center">
              {/* Product/Category Image */}
              <img 
                src={mainCategory.imageUrl || fallbacks[0]} 
                alt={mainCategory.name}
                className="max-h-full max-w-full object-contain rounded-md shadow-sm group-hover:scale-105 transition-transform duration-500 ease-out z-10"
              />
              
              {/* Green Circle Badge */}
              <div className="absolute left-[-20px] bottom-[20%] w-[100px] h-[100px] bg-[#66ad00] rounded-full flex flex-col items-center justify-center text-white z-20 shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl font-black leading-none">Top</span>
                <span className="text-sm font-medium leading-tight">Choice</span>
              </div>
            </div>
          </Link>

          {/* Right Column (2x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Render up to 3 sub-categories */}
            {subCategories.map((cat, index) => (
              <Link 
                key={cat.id}
                href={`/products?category=${cat.slug}`} 
                className="group bg-[#f1f1f1] rounded-2xl h-[200px] p-4 flex flex-col items-center overflow-hidden transition-all duration-300"
              >
                <div className="text-center relative z-10 mb-2">
                  <span className="text-primary text-[12px] font-medium tracking-wide">Explore Category</span>
                  <h3 className="text-[18px] font-black text-foreground mt-1 tracking-tight group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </div>
                
                <div className="mt-auto w-[80%] h-[55%] flex justify-center items-end pb-2">
                  <img 
                    src={cat.imageUrl || fallbacks[index + 1]} 
                    alt={cat.name}
                    className="max-h-full max-w-full object-contain rounded-md shadow-sm group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>
              </Link>
            ))}

            {/* If we have fewer than 3 sub-categories, pad the space with empty blocks to maintain layout? 
                Actually, the last block MUST be the "All Product" memphis block. 
                If we have exactly 3 sub-categories, this fills the remaining 4th slot perfectly. */}
            
            {/* Bottom Right: All Categories Block with Memphis Pattern */}
            <Link 
              href="/categories" 
              className="group relative bg-primary rounded-2xl h-[200px] p-4 flex flex-col items-center justify-center overflow-hidden transition-all duration-300"
            >
              {/* Memphis CSS Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-[2s] group-hover:scale-110"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10l10 10M30 10l-10 10' stroke='%23000' stroke-width='2' fill='none'/%3E%3Ccircle cx='70' cy='20' r='5' stroke='%23000' stroke-width='2' fill='none'/%3E%3Cpath d='M10 70 q 10 -10 20 0 t 20 0' stroke='%23000' stroke-width='2' fill='none'/%3E%3Crect x='70' y='70' width='10' height='10' stroke='%23000' stroke-width='2' fill='none' transform='rotate(45 75 75)'/%3E%3Cpolygon points='40,50 45,60 35,60' stroke='%23000' stroke-width='2' fill='none'/%3E%3C/svg%3E")`,
                  backgroundSize: '100px 100px'
                }}
              />
              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="text-white text-[18px] font-black tracking-wide group-hover:underline underline-offset-4">
                  All Categories
                </span>
              </div>
            </Link>

          </div>
        </div>

      </div>
    </section>
  );
}
