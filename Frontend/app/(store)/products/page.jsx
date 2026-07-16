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
  const page = parseInt(searchParams.page) || 1;
  const take = 9;
  const skip = (page - 1) * take;

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
  const [products, totalProducts, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        brand: true,
        category: true,
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const totalPages = Math.ceil(totalProducts / take);

  // Helper function to build pagination URLs
  const createPageUrl = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    return `?${params.toString()}`;
  };

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
              Showing {skip + 1}–{Math.min(skip + take, totalProducts)} of {totalProducts} Results
            </span>
            
            <ProductSort initialSort={sort} />
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <>
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

              {/* Pagination Controls */}
              <div className="mt-12 pt-8 border-t border-border flex justify-center items-center gap-6">
                <Link 
                  href={createPageUrl(Math.max(1, page - 1))}
                  className={`flex items-center gap-2 px-5 py-2.5 border rounded-sm font-semibold text-sm transition-colors ${page === 1 ? 'opacity-50 pointer-events-none text-muted-foreground bg-gray-50' : 'hover:bg-primary hover:text-white hover:border-primary text-foreground'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Previous
                </Link>
                
                <span className="text-sm font-medium text-muted-foreground">
                  Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
                </span>

                <Link 
                  href={createPageUrl(Math.min(totalPages, page + 1))}
                  className={`flex items-center gap-2 px-5 py-2.5 border rounded-sm font-semibold text-sm transition-colors ${page === totalPages ? 'opacity-50 pointer-events-none text-muted-foreground bg-gray-50' : 'hover:bg-primary hover:text-white hover:border-primary text-foreground'}`}
                >
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              </div>
            </>
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
