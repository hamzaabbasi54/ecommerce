"use client";

import { useEffect, useState } from "react";
import { getOrderById, cancelOrder, requestReturn } from "@/services/orderService";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function OrderDetailClient({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  const handleReturnSubmit = async () => {
    if (!returnReason.trim()) return window.alert("Please provide a reason for the return.");
    setIsReturning(true);
    try {
      const result = await requestReturn(orderId, { reason: returnReason, type: 'refund' });
      if (result.success) {
        window.alert("Return request submitted successfully. Check your email for confirmation.");
        setOrder({ ...order, status: 'return_requested' });
        setIsReturnModalOpen(false);
      } else {
        window.alert(result.message || "Failed to submit return request");
      }
    } catch (err) {
      window.alert(err.response?.data?.message || err.message || "Failed to submit return request");
    } finally {
      setIsReturning(false);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      setIsCancelling(true);
      try {
        const result = await cancelOrder(orderId);
        if (result.success) {
          window.alert("Order cancelled successfully");
          // Update the local state to reflect cancellation
          setOrder({ ...order, status: 'cancelled' });
        } else {
          window.alert(result.message || "Failed to cancel order");
        }
      } catch (err) {
        window.alert(err.response?.data?.message || err.message || "Failed to cancel order");
      } finally {
        setIsCancelling(false);
      }
    }
  };

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
    <>
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-surface-variant pb-3">
        <div>
          <h1 className="text-xl font-bold text-on-background flex items-center gap-2">
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            Order #{order.id.substring(0, 8).toUpperCase()}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 ml-7">
            Placed on {new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(order.createdAt))}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-surface-variant rounded-full w-fit">
            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'pending' ? 'bg-amber-500' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'}`}></span>
            <span className="text-xs font-medium capitalize text-on-surface-variant">
              {order.status}
            </span>
          </div>
          {(order.status === 'pending' || order.status === 'processing') && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-transparent border border-error text-error px-3 py-1 rounded-full text-xs font-medium hover:bg-error/10 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          {order.status === 'delivered' && (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="bg-transparent border border-primary text-primary px-3 py-1 rounded-full text-xs font-medium hover:bg-primary/10 transition-colors cursor-pointer"
            >
              Return Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative items-start">
        {/* Left Column: Items */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <section className="bg-surface-container-lowest border border-surface-variant p-4 rounded-lg">
            <h2 className="text-base font-semibold text-on-background mb-3 pb-2 border-b border-surface-variant">Items Ordered</h2>
            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2">
              {order.items.map((item) => {
                const product = item.product;
                return (
                  <div key={item.id} className="flex gap-3 items-center py-2 border-b border-surface-variant last:border-0 last:pb-0">
                    <div className="w-12 h-12 bg-surface border border-surface-variant rounded flex items-center justify-center overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={product?.images?.[0] || '/placeholder.png'} 
                        alt={product?.name || 'Product'}
                        className="object-cover w-full h-full mix-blend-multiply" 
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <Link href={`/products/${product?.slug}`} className="text-sm font-medium text-on-background hover:text-primary transition-colors truncate block" title={product?.name}>
                        {product?.name || 'Unknown Product'}
                      </Link>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{product?.brand?.name}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-on-background text-right shrink-0">
                      ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Combined Order Summary & Info */}
        <div className="lg:col-span-4">
          <section className="bg-surface-container-lowest border border-surface-variant p-4 rounded-lg flex flex-col gap-4 lg:sticky lg:top-24">
            
            {/* Order Summary */}
            <div>
              <h2 className="text-sm font-semibold text-on-background mb-2 pb-1 border-b border-surface-variant">Order Summary</h2>
              <div className="flex flex-col gap-1.5 mb-2">
                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="text-on-background">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>Shipping</span>
                  <span className="text-on-background">{order.shippingCharge === 0 ? 'Free' : `$${order.shippingCharge.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>Estimated Tax</span>
                  <span className="text-on-background">${order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center text-xs text-green-600">
                    <span>Discount</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-base font-bold text-on-background pt-2 border-t border-surface-variant">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Details */}
            <div>
              <h2 className="text-sm font-semibold text-on-background mb-2 pb-1 border-b border-surface-variant">Shipping Details</h2>
              {order.address ? (
                <div className="text-xs text-on-surface-variant flex flex-col gap-1">
                  <span className="font-medium text-on-background">{order.address.street}</span>
                  <span>{order.address.city}, {order.address.province} {order.address.postalCode}</span>
                  <span>{order.address.country}</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No shipping details provided.</span>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-sm font-semibold text-on-background mb-2 pb-1 border-b border-surface-variant">Payment Method</h2>
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant p-2 bg-surface-container rounded border border-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>
                  {order.paymentMethod === 'cod' ? 'local_shipping' : 'credit_card'}
                </span>
                <span className="capitalize font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.replace('_', ' ')}</span>
              </div>
            </div>

          </section>
        </div>
      </div>
    </main>

      {/* Return Order Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surface-variant rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-on-background mb-4">Request Return</h3>
            <p className="text-sm text-muted-foreground mb-4">Please provide a reason for returning this order. Our support team will review it and get back to you via email.</p>
            <textarea
              className="w-full bg-surface-container border border-surface-variant rounded p-3 text-sm text-on-background focus:outline-none focus:border-primary mb-4 min-h-[100px] resize-y"
              placeholder="E.g., Item arrived damaged, wrong item sent, etc."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-background cursor-pointer"
                disabled={isReturning}
              >
                Cancel
              </button>
              <button
                onClick={handleReturnSubmit}
                disabled={isReturning}
                className="px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isReturning && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
