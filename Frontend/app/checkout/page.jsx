import CheckoutClient from '@/components/checkout/CheckoutClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth'; // Ensure this exists, or use your custom auth check
import prisma from '@/lib/prisma'; // Add this to check auth manually if verifyAuth needs request

export const metadata = {
  title: 'Secure Checkout | Electronica',
  description: 'Complete your purchase securely.',
};

export default async function CheckoutPage() {
  // We can do a quick server-side check for auth.
  // If not authenticated, redirect to /login?redirect=/checkout
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  if (!token) {
    redirect('/login?redirect=/checkout');
  }

  // Assuming verifyAuth or similar will handle actual token validation in the API,
  // this is just a quick UX redirect.

  return <CheckoutClient />;
}
