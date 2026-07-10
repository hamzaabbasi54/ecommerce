import prisma from '@/lib/prisma';
import ReviewList from '@/components/admin/reviews/ReviewList';

export const metadata = {
  title: 'Manage Reviews | Admin',
};

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, profileImage: true } },
      product: { select: { id: true, name: true, images: true } }
    }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reviews</h1>
        <p className="text-muted-foreground mt-2">Moderate customer reviews and feedback.</p>
      </div>

      <ReviewList initialReviews={reviews} />
    </div>
  );
}
