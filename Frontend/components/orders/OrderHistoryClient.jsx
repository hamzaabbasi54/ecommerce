"use client";

import { useEffect, useState } from "react";
import { getMyOrders } from "@/services/orderService";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function OrderHistoryClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await getMyOrders();
        if (result.success) {
          setOrders(result.data);
        } else {
          setError(result.message || "Failed to load orders.");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="material-symbols-outlined text-[64px] text-error mb-md">error</span>
        <h2 className="font-h3 text-h3 text-on-background mb-sm">Something went wrong</h2>
        <p className="font-body-md text-body-md text-muted-foreground mb-lg">{error}</p>
        <Link href="/products" className="bg-primary text-on-primary px-lg py-md rounded font-button text-button">
          Continue Shopping
        </Link>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="material-symbols-outlined text-[64px] text-outline mb-md">receipt_long</span>
        <h2 className="font-h3 text-h3 text-on-background mb-sm">No orders yet</h2>
        <p className="font-body-md text-body-md text-muted-foreground mb-lg">Looks like you haven't placed any orders. Discover our latest engineered excellence.</p>
        <Link href="/products" className="bg-primary text-on-primary px-lg py-md rounded font-button text-button">
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="mb-lg">
        <h1 className="font-h2 text-h2 text-on-background">My Orders</h1>
        <p className="font-body-md text-body-md text-muted-foreground mt-sm">View your complete order history.</p>
      </div>

      <div className="flex flex-col gap-lg">
        {orders.map((order) => {
          // Display up to 3 thumbnails
          const previewItems = order.items.slice(0, 3);
          const hasMore = order.items.length > 3;

          return (
            <div key={order.id} className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md mb-md pb-sm border-b border-surface-variant">
                <div>
                  <h3 className="font-h4 text-h4 text-on-background">Order #{order.id.substring(0, 8).toUpperCase()}</h3>
                  <p className="font-body-md text-body-md text-muted-foreground mt-xs">
                    Placed on {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <div className="flex flex-col md:items-end gap-sm">
                  <span className="font-h4 text-h4 text-on-background">${order.total.toFixed(2)}</span>
                  <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-container border border-surface-variant rounded-full w-fit">
                    <span className={`w-2 h-2 rounded-full ${order.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                    <span className="font-label-sm text-label-sm capitalize text-on-surface-variant">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md mt-md">
                <div className="flex items-center gap-sm">
                  {previewItems.map((item, idx) => (
                    <div key={idx} className="w-16 h-16 bg-surface border border-surface-variant rounded flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.product?.images?.[0] || '/placeholder.png'} 
                        alt={item.product?.name || 'Product'}
                        className="object-cover w-full h-full mix-blend-multiply" 
                      />
                    </div>
                  ))}
                  {hasMore && (
                    <div className="w-16 h-16 bg-surface-container border border-surface-variant rounded flex items-center justify-center shrink-0">
                      <span className="font-body-md text-body-md font-medium text-muted-foreground">+{order.items.length - 3}</span>
                    </div>
                  )}
                </div>

                <Link 
                  href={`/orders/${order.id}`}
                  className="bg-transparent border border-outline text-on-surface px-md py-sm rounded-lg font-button text-button hover:bg-surface-container-low transition-colors w-full sm:w-auto text-center shrink-0"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
