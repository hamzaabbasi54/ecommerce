import CartClient from '@/components/cart/CartClient';

export const metadata = {
  title: 'Shopping Cart - Electronica',
  description: 'Review your items and proceed to checkout.',
};

export default function CartPage() {
  return (
    <div className="w-full">
      <CartClient />
    </div>
  );
}
