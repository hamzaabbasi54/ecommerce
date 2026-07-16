import prisma from '@/lib/prisma';
import ProductGallery from '@/components/products/ProductGallery';
import ProductActions from '@/components/products/ProductActions';
import ProductReviews from '@/components/products/ProductReviews';
import ProductTabs from '@/components/products/ProductTabs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Star } from 'lucide-react';

export async function generateMetadata({ params }) {
  const p = await params;
  const product = await prisma.product.findFirst({
    where: { 
      OR: [{ slug: p.slug }, { id: p.slug }] 
    }
  });

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | Electronica`,
    description: product.description || 'Premium electronics for the modern professional.',
  };
}

export default async function ProductDetailsPage(props) {
  // Await params for Next.js 15+ compatibility
  const p = await props.params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ slug: p.slug }, { id: p.slug }],
      isActive: true,
      deletedAt: null
    },
    include: {
      brand: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: { name: true, profileImage: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
      deletedAt: null
    },
    take: 4,
    include: {
      category: true
    }
  });

  const currentPrice = product.discountPrice ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice ? product.price : null;

  const reviewCount = product.reviews.length;
  const avgRating = reviewCount > 0 
    ? product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount
    : 0;

  return (
    <main className="flex-grow flex flex-col w-full bg-[#fcfcfc]">
      {/* Breadcrumbs */}
      <div className="bg-[#f9f9f9] w-full py-4 mb-4 border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex justify-center animate-in fade-in duration-500">
          <nav aria-label="Breadcrumb" className="flex text-muted-foreground text-xs md:text-sm">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="h-3 w-3 mx-1" />
                  <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
                </div>
              </li>
              {product.category && (
                <li>
                  <div className="flex items-center">
                    <ChevronRight className="h-3 w-3 mx-1" />
                    <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary transition-colors">
                      {product.category.name}
                    </Link>
                  </div>
                </li>
              )}
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="h-3 w-3 mx-1" />
                  <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Product Top Section */}
      <section className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        {/* Left: Imagery (Client Component) */}
        <ProductGallery images={product.images || []} altText={product.name} />

        {/* Right: Product Info & Actions */}
        <div className="flex flex-col animate-in fade-in slide-in-from-right-8 duration-700 mt-4 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            Categories: <span className="text-[#0066cc] font-medium cursor-pointer hover:underline">{product.category?.name || 'Electronics'}</span>, <span className="text-[#0066cc] font-medium cursor-pointer hover:underline">{product.brand?.name || 'Electronica'}</span>
          </div>

          <div className="flex items-center gap-2 mt-3 mb-4">
            <div className="flex text-[#ffcc00]">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className={`h-4 w-4 ${avgRating >= star ? 'fill-[#ffcc00]' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-xs text-gray-400">({reviewCount} customer reviews)</span>
          </div>
          
          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-prose">
            {product.description 
              ? product.description.substring(0, 150) + '...' 
              : 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante.'}
          </p>

          <div className="flex items-center gap-3 mb-6">
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">${originalPrice?.toFixed(2)}</span>
            )}
            <span className="text-2xl font-bold text-[#669900]">${currentPrice?.toFixed(2)}</span>
          </div>

          {/* Actions (Client Component) */}
          <ProductActions productId={product.id} stock={product.stock} />
        </div>
      </section>

      {/* Tabs Section for Description & Reviews */}
      <ProductTabs 
        description={product.description || 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.'} 
        reviewsComponent={<ProductReviews productId={product.id} initialReviews={product.reviews || []} />}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-16">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Related products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => (
              <Link href={`/products/${rp.slug}`} key={rp.id} className="group bg-white border border-gray-100 p-6 hover:shadow-lg transition-shadow text-center flex flex-col items-center">
                <div className="w-full aspect-square mb-6 overflow-hidden relative flex items-center justify-center">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img src={rp.images?.[0] || '/placeholder.png'} alt={rp.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-[10px] text-gray-400 mb-2 uppercase tracking-wide">{rp.category?.name || 'Category'}</span>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{rp.name}</h3>
                <span className="text-[#669900] font-bold text-sm">${(rp.discountPrice || rp.price).toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
