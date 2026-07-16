import Link from 'next/link';

export default function CategoryCard({ category }) {
  // Provide specific premium images for each known category
  const categoryImages = {
    'laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',
    'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    'audio': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80',
    'accessories': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'
  };

  const bgImage = category.image || categoryImages[category.slug] || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80';

  return (
    <Link 
      href={`/products?category=${category.slug}`}
      className="group relative h-full min-h-[200px] w-full rounded-2xl overflow-hidden border border-[#e5e5e5] bg-white block cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
    >
      {/* Background Image shifted to the right half */}
      <div 
        className="absolute right-0 top-0 w-[60%] h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      
      {/* Soft gradient from left to fade out the image */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent w-[80%]" />
      
      {/* Content */}
      <div className="absolute top-0 left-0 p-6 h-full flex flex-col justify-center max-w-[70%] z-10">
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
          {category.name}
        </h2>
        
        <div className="flex items-center text-primary text-xs font-bold uppercase tracking-wider mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
          <span>Explore</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </Link>
  );
}
