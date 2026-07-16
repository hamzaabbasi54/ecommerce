"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { lookupOrder, requestReturn } from "@/services/orderService";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderId, setOrderId] = useState(initialOrderId);
  const [contactInfo, setContactInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  // Return/Exchange State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnType, setReturnType] = useState("refund");
  const [returnReason, setReturnReason] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState(false);

  // Handle Lookup
  const handleLookup = async (e) => {
    e?.preventDefault();
    if (!orderId.trim() || !contactInfo.trim()) {
      setError("Please provide both an Order ID and Email/Phone number.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);
    setReturnSuccess(false);

    try {
      // Determine if contactInfo is an email or phone
      const isEmail = contactInfo.includes("@");
      const payload = { orderId: orderId.trim() };
      if (isEmail) {
        payload.email = contactInfo.trim();
      } else {
        payload.phone = contactInfo.trim();
      }

      const result = await lookupOrder(payload);
      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.message || "Failed to find order.");
      }
    } catch (err) {
      if (err.response && err.response.status === 429) {
        setError("Too many lookup attempts. Please try again later.");
      } else {
        setError(err.response?.data?.message || err.message || "Order not found or contact details do not match.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Return Submission
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) {
      setReturnError("Please provide a reason for the request.");
      return;
    }

    setReturnLoading(true);
    setReturnError("");

    try {
      const isEmail = contactInfo.includes("@");
      const payload = {
        type: returnType,
        reason: returnReason.trim(),
      };
      
      if (isEmail) payload.email = contactInfo.trim();
      else payload.phone = contactInfo.trim();

      const result = await requestReturn(order.id, payload);
      if (result.success) {
        setReturnSuccess(true);
        setShowReturnModal(false);
        // Refresh order details to show the new request
        handleLookup(); 
      } else {
        setReturnError(result.message || "Failed to submit request.");
      }
    } catch (err) {
      setReturnError(err.response?.data?.message || err.message || "Failed to submit request.");
    } finally {
      setReturnLoading(false);
    }
  };

  // Render Form if no order is loaded
  if (!order) {
    return (
      <div className="py-20 min-h-[60vh] px-4 w-full">
        <div className="w-full max-w-[480px] mx-auto bg-surface-container-lowest border border-surface-variant p-6 rounded-lg shadow-sm">
          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-on-background">Track Your Order</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your order ID and contact info to view details.</p>
          </div>

          <form onSubmit={handleLookup} className="flex flex-col gap-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-on-background mb-1">Order ID</label>
              <input
                id="orderId"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. cmrnf2auv000..."
                className="w-full bg-surface text-on-background px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
            
            <div>
              <label htmlFor="contactInfo" className="block text-sm font-medium text-on-background mb-1">Email or Phone Number</label>
              <input
                id="contactInfo"
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Used during checkout"
                className="w-full bg-surface text-on-background px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-md text-error text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-2.5 rounded-lg font-button text-button hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Find Order'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Order Details
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 relative">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-surface-variant pb-3">
        <div>
          <h1 className="text-xl font-bold text-on-background flex items-center gap-2">
            <button onClick={() => setOrder(null)} className="text-muted-foreground hover:text-primary transition-colors flex items-center">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            Order #{order.orderNumber}
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

          {order.returnEligibility?.eligible && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="bg-transparent border border-primary text-primary px-3 py-1 rounded-full text-xs font-medium hover:bg-primary/10 transition-colors"
            >
              Request Refund / Exchange
            </button>
          )}
        </div>
      </div>

      {order.returnEligibility && !order.returnEligibility.eligible && order.status === 'delivered' && (
        <div className="mb-4 p-3 bg-surface-container border border-surface-variant rounded-lg text-sm text-muted-foreground">
          Refund/Exchange unavailable: {order.returnEligibility.reason}
        </div>
      )}

      {order.returnRequests && order.returnRequests.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {order.returnRequests.map((req) => (
            <div key={req.id} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-semibold text-amber-700 capitalize">{req.type} Request</span>
                <p className="text-xs text-amber-700/80 mt-0.5">Submitted on {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(req.createdAt))}</p>
              </div>
              <div className="px-2 py-1 bg-amber-500/20 text-amber-700 text-xs font-bold uppercase rounded">
                {req.status}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={() => setShowReturnModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-on-background">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-lg font-bold text-on-background mb-4">Request Refund or Exchange</h2>
            
            <form onSubmit={handleReturnSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-on-background mb-1">Request Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="refund" checked={returnType === 'refund'} onChange={() => setReturnType('refund')} className="accent-primary" />
                    <span className="text-sm text-on-background">Refund</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="exchange" checked={returnType === 'exchange'} onChange={() => setReturnType('exchange')} className="accent-primary" />
                    <span className="text-sm text-on-background">Exchange</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-on-background mb-1">Reason for Request</label>
                <textarea
                  id="reason"
                  rows={4}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please describe why you are requesting a return/exchange..."
                  className="w-full bg-surface text-on-background px-3 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                  required
                />
              </div>

              {returnError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-md text-error text-xs">
                  {returnError}
                </div>
              )}

              <button
                type="submit"
                disabled={returnLoading}
                className="w-full bg-primary text-on-primary py-2 rounded-lg font-button text-sm hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50 flex items-center justify-center"
              >
                {returnLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid structure reusing styles from OrderDetailClient */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <section className="bg-surface-container-lowest border border-surface-variant p-4 rounded-lg">
            <h2 className="text-base font-semibold text-on-background mb-3 pb-2 border-b border-surface-variant">Items Ordered</h2>
            <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center py-2 border-b border-surface-variant last:border-0 last:pb-0">
                  <div className="w-12 h-12 bg-surface border border-surface-variant rounded flex items-center justify-center overflow-hidden shrink-0">
                    <img 
                      src={item.product?.images?.[0] || '/placeholder.png'} 
                      alt={item.product?.name || 'Product'}
                      className="object-cover w-full h-full mix-blend-multiply" 
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <Link href={`/products/${item.product?.id}`} className="text-sm font-medium text-on-background hover:text-primary transition-colors truncate block" title={item.product?.name}>
                      {item.product?.name || 'Unknown Product'}
                    </Link>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-on-background text-right shrink-0">
                    ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4">
          <section className="bg-surface-container-lowest border border-surface-variant p-4 rounded-lg flex flex-col gap-4 lg:sticky lg:top-24">
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
  );
}
