import Link from 'next/link';

export default function CategoryCard({ category }) {
  // Provide specific premium images for each known category
  const categoryImages = {
    'laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
    'smartphones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'audio': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
    'accessories': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
  };

  // Use the database image, then the slug-mapped image, then a generic tech placeholder
  const bgImage = category.image || categoryImages[category.slug] || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80';

  return (
    <Link 
      href={`/products?category=${category.slug}`}
      className="group relative h-96 w-full rounded-lg overflow-hidden border border-border bg-surface-container-lowest block cursor-pointer"
    >
      {/* Background Image with hover scale effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-500 group-hover:-translate-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
          {category.name}
        </h2>
        {/* We omitted the subtitle per user request, but we can add a subtle arrow indicator */}
        <div className="flex items-center text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-2">
          <span>Shop Collection</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </Link>
  );
}
