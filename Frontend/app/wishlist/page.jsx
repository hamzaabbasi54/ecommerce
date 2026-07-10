import WishlistClient from '@/components/wishlist/WishlistClient';

export const metadata = {
  title: 'My Wishlist - Electronica',
  description: 'View your saved items.',
};

export default function WishlistPage() {
  return (
    <div className="w-full">
      <WishlistClient />
    </div>
  );
}
