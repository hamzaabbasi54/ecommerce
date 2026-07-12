import prisma from '@/lib/prisma';
import ProductFilters from '@/components/products/ProductFilters';
import ProductCard from '@/components/shared/ProductCard';
import ProductSort from '@/components/products/ProductSort';
import ProductSearch from '@/components/products/ProductSearch';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Shop All Products | Electronica',
  description: 'Browse our curated collection of premium electronics.',
};

export default async function ProductsPage(props) {
  // Await searchParams as required by Next.js 15+ App Router
  const searchParams = await props.searchParams;

  // Extract filters from searchParams
  const categorySlug = searchParams.category || null;
  const brandSlug = searchParams.brand || null;
  const minPrice = searchParams.minPrice ? parseFloat(searchParams.minPrice) : null;
  const maxPrice = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null;
  const sort = searchParams.sort || 'newest';
  const sale = searchParams.sale === 'true';
  const searchQuery = searchParams.search || null;

  // Build the Prisma query
  const where = {
    isActive: true,
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }
  if (minPrice !== null || maxPrice !== null) {
    where.price = {};
    if (minPrice !== null) where.price.gte = minPrice;
    if (maxPrice !== null) where.price.lte = maxPrice;
  }
  if (sale) {
    where.discountPrice = { not: null };
  }
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { brand: { name: { contains: searchQuery, mode: 'insensitive' } } },
      { category: { name: { contains: searchQuery, mode: 'insensitive' } } },
    ];
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') {
    orderBy = { price: 'asc' };
  } else if (sort === 'price_desc') {
    orderBy = { price: 'desc' };
  }

  // Fetch data in parallel
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: {
        brand: true,
        category: true,
      },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return (
    <main className="flex-grow max-w-[1280px] w-full mx-auto px-4 md:px-8 py-12">
      {/* Breadcrumb & Header */}
      <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <nav className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Shop</span>
        </nav>
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground whitespace-nowrap">All Products</h1>
          <ProductSearch />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Sidebar (Filters) */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <ProductFilters categories={categories} brands={brands} />
        </aside>

        {/* Main Content Area */}
        <div className="flex-grow">
          {/* Control Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-border pb-4 animate-in fade-in duration-700">
            <span className="text-muted-foreground text-sm mb-4 sm:mb-0">
              Showing {products.length} {products.length === 1 ? 'Result' : 'Results'}
            </span>
            
            <ProductSort initialSort={sort} />
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center animate-in fade-in">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or search criteria.</p>
              <Link href="/products" className="text-primary hover:underline font-medium">
                Clear all filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
