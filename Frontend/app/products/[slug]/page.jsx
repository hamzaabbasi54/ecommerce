import prisma from '@/lib/prisma';
import ProductGallery from '@/components/products/ProductGallery';
import ProductActions from '@/components/products/ProductActions';
import ProductReviews from '@/components/products/ProductReviews';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

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

  const currentPrice = product.discountPrice ? product.discountPrice : product.price;
  const originalPrice = product.discountPrice ? product.price : null;

  return (
    <main className="flex-grow flex flex-col w-full">
      {/* Breadcrumbs */}
      <div className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-6 animate-in fade-in duration-500">
        <nav aria-label="Breadcrumb" className="flex text-muted-foreground text-sm">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
              </div>
            </li>
            {product.category && (
              <li>
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 mx-1" />
                  <Link href={`/products?category=${product.category.slug}`} className="hover:text-primary transition-colors">
                    {product.category.name}
                  </Link>
                </div>
              </li>
            )}
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Product Top Section */}
      <section className="max-w-[1280px] mx-auto w-full px-4 md:px-8 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left: Imagery (Client Component) */}
        <ProductGallery images={product.images || []} altText={product.name} />

        {/* Right: Product Info & Actions */}
        <div className="flex flex-col pt-4 animate-in fade-in slide-in-from-right-8 duration-700">
          <span className="text-sm text-muted-foreground tracking-widest uppercase mb-2 font-semibold">
            {product.brand?.name || 'Electronica'}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-bold text-foreground">${currentPrice?.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-xl text-muted-foreground line-through">${originalPrice?.toFixed(2)}</span>
            )}
            {product.stock > 0 ? (
              <span className="bg-surface-container-high text-foreground text-xs font-semibold px-3 py-1.5 rounded-sm border border-border ml-2">
                In Stock ({product.stock})
              </span>
            ) : (
              <span className="bg-destructive/10 text-destructive text-xs font-semibold px-3 py-1.5 rounded-sm ml-2">
                Out of Stock
              </span>
            )}
          </div>
          
          <p className="text-base text-muted-foreground mb-10 leading-relaxed max-w-prose">
            {product.description || 'Experience premium technology engineered for excellence.'}
          </p>

          {/* Actions (Client Component) */}
          <ProductActions productId={product.id} stock={product.stock} />
        </div>
      </section>

      {/* Bottom Section: Reviews (Client Component for form state) */}
      <ProductReviews productId={product.id} initialReviews={product.reviews || []} />
    </main>
  );
}
