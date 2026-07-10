import prisma from '@/lib/prisma';
import BrandCard from '@/components/brands/BrandCard';

export const metadata = {
  title: 'Premium Partners | Electronica',
  description: 'Shop top-tier technology from industry leaders.',
};

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 md:px-10 py-16 md:py-24 min-h-[70vh]">
      {/* Header Section */}
      <header className="text-center mb-16 md:mb-20 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
          Our Premium Partners
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Shop top-tier technology from industry leaders.
        </p>
      </header>

      {/* Brands Grid */}
      {brands.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {brands.map((brand, index) => (
            <div 
              key={brand.id}
              className="animate-in fade-in zoom-in-95 fill-mode-both"
              style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
            >
              <BrandCard brand={brand} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground animate-in fade-in">
          <p className="text-lg">No brands found at this time.</p>
        </div>
      )}
    </main>
  );
}
