"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '123456789';

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-md shadow-sm">
        <span className="material-symbols-outlined text-[48px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
      </div>
      
      <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-on-background mb-sm">
        Thank you for your order!
      </h1>
      
      <p className="font-body-lg text-body-lg text-muted-foreground mb-xl">
        Order <strong className="text-on-background">#{orderId.substring(0, 8).toUpperCase()}</strong> has been placed successfully.
      </p>

      <div className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg w-full max-w-[450px] mb-xl shadow-sm text-left">
        <h3 className="font-h4 text-h4 text-on-background mb-xs">What's Next?</h3>
        <p className="font-body-md text-body-md text-muted-foreground">
          We&apos;ll send an order confirmation email with details of your order and a link to track its progress.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-md">
        <Link 
          href="/products" 
          className="bg-primary text-on-primary px-xl py-md rounded-lg font-button text-button hover:bg-surface-tint active:scale-[0.98] transition-all"
        >
          Continue Shopping
        </Link>
        <Link 
          href={`/track-order?orderId=${orderId}`}
          className="bg-transparent border border-outline text-on-surface px-xl py-md rounded-lg font-button text-button hover:bg-surface-container-low transition-colors"
        >
          View Order Details
        </Link>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </main>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
