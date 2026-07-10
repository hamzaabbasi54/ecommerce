"use client";

import { useEffect, useState } from "react";
import { getOrderById } from "@/services/orderService";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function OrderDetailClient({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const result = await getOrderById(orderId);
        if (result.success) {
          setOrder(result.data);
        } else {
          setError(result.message || "Failed to load order.");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="material-symbols-outlined text-[64px] text-error mb-md">error</span>
        <h2 className="font-h3 text-h3 text-on-background mb-sm">Order Not Found</h2>
        <p className="font-body-md text-body-md text-muted-foreground mb-lg">{error}</p>
        <Link href="/products" className="bg-primary text-on-primary px-lg py-md rounded font-button text-button">
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="mb-lg flex flex-col md:flex-row md:items-center md:justify-between gap-md">
        <div>
          <h1 className="font-h2 text-h2 text-on-background flex items-center gap-sm">
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </Link>
            Order #{order.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="font-body-md text-body-md text-muted-foreground mt-sm">
            Placed on {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(order.createdAt))}
          </p>
        </div>
        <div className="inline-flex items-center gap-xs px-md py-sm bg-surface-container border border-surface-variant rounded-full w-fit">
          <span className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
          <span className="font-label-sm text-label-sm capitalize text-on-surface-variant">
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl relative">
        {/* Left Column: Items */}
        <div className="lg:col-span-8 flex flex-col gap-lg">
          <section className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg">
            <h2 className="font-h4 text-h4 text-on-background mb-md pb-sm border-b border-surface-variant">Items Ordered</h2>
            <div className="flex flex-col gap-md">
              {order.items.map((item) => {
                const product = item.product;
                return (
                  <div key={item.id} className="flex gap-md items-center py-sm border-b border-surface-variant last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-surface border border-surface-variant rounded flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={product?.images?.[0] || '/placeholder.png'} 
                        alt={product?.name || 'Product'}
                        className="object-cover w-full h-full mix-blend-multiply" 
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <Link href={`/products/${product?.slug}`} className="font-body-md text-body-md font-medium text-on-background hover:text-primary transition-colors truncate block" title={product?.name}>
                        {product?.name || 'Unknown Product'}
                      </Link>
                      <p className="font-label-sm text-label-sm text-muted-foreground mt-xs">{product?.brand?.name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-body-md text-body-md text-on-background text-right shrink-0">
                      ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Info */}
        <div className="lg:col-span-4 flex flex-col gap-lg">
          <section className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg lg:sticky lg:top-32">
            <h2 className="font-h4 text-h4 text-on-background mb-md pb-sm border-b border-surface-variant">Order Summary</h2>
            <div className="flex flex-col gap-sm mb-lg">
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span className="text-on-background">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Shipping</span>
                <span className="text-on-background">{order.shippingCharge === 0 ? 'Free' : `$${order.shippingCharge.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Estimated Tax</span>
                <span className="text-on-background">${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between items-center font-body-md text-body-md text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center font-h3 text-h3 text-on-background mb-md pt-md border-t border-surface-variant">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg">
            <h2 className="font-h4 text-h4 text-on-background mb-md pb-sm border-b border-surface-variant">Shipping Details</h2>
            {order.address ? (
              <div className="font-body-md text-body-md text-on-surface-variant flex flex-col gap-xs">
                <span className="font-medium text-on-background">{order.address.street}</span>
                <span>{order.address.city}, {order.address.province} {order.address.postalCode}</span>
                <span>{order.address.country}</span>
              </div>
            ) : (
              <span className="text-muted-foreground">No shipping details provided.</span>
            )}
          </section>

          <section className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg">
            <h2 className="font-h4 text-h4 text-on-background mb-md pb-sm border-b border-surface-variant">Payment Method</h2>
            <div className="flex items-center gap-sm font-body-md text-body-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>
                {order.paymentMethod === 'paypal' ? 'paypal' : 'credit_card'}
              </span>
              <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
