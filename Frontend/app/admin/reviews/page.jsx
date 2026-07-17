import prisma from '@/lib/prisma';
import ReviewList from '@/components/admin/reviews/ReviewList';

export const metadata = {
  title: 'Manage Reviews | Admin',
};

export default async function AdminReviewsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = parseInt(resolvedParams.page) || 1;
  const limit = parseInt(resolvedParams.limit) || 10;
  const q = resolvedParams.q || '';
  const skip = (page - 1) * limit;

  const where = q ? {
    OR: [
      { comment: { contains: q, mode: 'insensitive' } },
      { user: { name: { contains: q, mode: 'insensitive' } } },
      { product: { name: { contains: q, mode: 'insensitive' } } }
    ]
  } : {};

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    include: {
      user: { select: { id: true, name: true, profileImage: true } },
      product: { select: { id: true, name: true, images: true } }
    }
  }),
    prisma.review.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reviews</h1>
        <p className="text-muted-foreground mt-2">Moderate customer reviews and feedback.</p>
      </div>

      <ReviewList initialReviews={reviews} currentPage={page} totalPages={totalPages} initialQuery={q} />
    </div>
  );
}
