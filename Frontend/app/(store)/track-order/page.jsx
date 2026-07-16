import TrackOrderClient from '@/components/orders/TrackOrderClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Track Your Order | Electronica',
  description: 'Track the status of your recent order without logging in.',
};

export default async function TrackOrderPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  // If the user is logged in, redirect them to their full order history
  if (token) {
    redirect('/orders');
  }

  return (
    <Suspense fallback={
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    }>
      <TrackOrderClient />
    </Suspense>
  );
}
