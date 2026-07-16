import prisma from '@/lib/prisma';
import Hero from '@/components/home/Hero';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import ProductGrid from '@/components/home/ProductGrid';
import BrandsShowcase from '@/components/home/BrandsShowcase';
import SpecialOffersCarousel from '@/components/home/SpecialOffersCarousel';

export const metadata = {
  title: 'Electronica | Premium Electronics & Tech',
  description: 'Experience engineered excellence. Shop our curated collection of premium electronics, gadgets, and peripherals.',
};

export default async function HomePage() {
  // Fetch data in parallel for performance
  const [
    categories,
    latestProducts,
    specialOffers,
    brands
  ] = await Promise.all([
    // 1. Fetch top 4 categories for Bento Grid
    prisma.category.findMany({
      where: { parentId: null }, // Top level categories
      take: 4,
      orderBy: { name: 'asc' }
    }),
    
    // 2. Fetch 4 newest products
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { brand: true }
    }),

    // 3. Fetch 4 special offers (products with a discount)
    prisma.product.findMany({
      where: { isActive: true, deletedAt: null, discountPrice: { not: null } },
      take: 4,
      orderBy: { discountPrice: 'asc' }, // Or any other sorting logic for deals
      include: { brand: true }
    }),

    // 4. Fetch premium brands
    prisma.brand.findMany({
      take: 6,
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Categories Grid */}
      {categories.length > 0 && (
        <FeaturedCategories categories={categories} />
      )}
      
      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <ProductGrid title="Latest Arrivals" products={latestProducts} />
      )}
      
      {/* Brands Showcase */}
      {brands.length > 0 && (
        <BrandsShowcase brands={brands} />
      )}
      
      {/* Special Offers (On Sale) */}
      {specialOffers.length > 0 && (
        <SpecialOffersCarousel products={specialOffers} />
      )}
    </div>
  );
}
