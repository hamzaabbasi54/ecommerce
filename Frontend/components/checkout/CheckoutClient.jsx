"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import useCartStore from "@/hooks/useCart";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  province: z.string().optional(),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  paymentMethod: z.string()
});

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, loading: cartLoading, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isSubmittingRef = useRef(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "United States",
      paymentMethod: "cod",
    }
  });

  const cartItems = cart?.items || [];
  
  let subtotal = 0;
  cartItems.forEach((item) => {
    const price = item.product.discountPrice || item.product.price;
    subtotal += price * item.quantity;
  });

  const taxRate = 0.08;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const taxableAmount = subtotal - discount;
  const tax = Number((taxableAmount * taxRate).toFixed(2));
  const total = taxableAmount + tax;

  // Apply coupon handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponError("");
    setCouponLoading(true);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), subtotal })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Invalid coupon');
      }

      setAppliedCoupon(result.data);
      setCouponError("");
    } catch (error) {
      setCouponError(error.message);
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const onSubmit = async (data) => {
    // Guard against double submission
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: {
            firstName: data.firstName,
            lastName: data.lastName,
            street: data.street,
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
            country: data.country
          },
          email: data.email,
          paymentMethod: data.paymentMethod,
          couponCode: appliedCoupon ? appliedCoupon.code : null
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to place order');
      }

      await clearCart();
      router.push(`/checkout/success?orderId=${result.data.id}`);
      
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  if (cartLoading && !cart) {
    return (
      <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col items-center justify-center min-h-[50vh] text-center">
        <span className="material-symbols-outlined text-[64px] text-outline mb-md">shopping_bag</span>
        <h2 className="font-h3 text-h3 text-on-background mb-sm">Your cart is empty</h2>
        <p className="font-body-md text-body-md text-muted-foreground mb-lg">Add some items to your cart before checking out.</p>
        <Link href="/products" className="bg-primary text-on-primary px-lg py-md rounded font-button text-button">
          Continue Shopping
        </Link>
      </main>
    );
  } else if (cartItems.length === 0 && isSubmitting) {
    return (
      <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-primary font-medium">Processing your order...</span>
      </div>
    );
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4">
      <div className="mb-4 border-b border-surface-variant pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-on-background">Secure Checkout</h1>
      </div>

      {submitError && (
        <div className="mb-4 p-2 bg-error-container text-on-error-container rounded border border-error/20 text-xs">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative items-start">
        {/* Left Column: Unified Form */}
        <div className="lg:col-span-7">
          <section className="bg-surface-container-lowest border border-surface-variant p-4 rounded-lg flex flex-col gap-4">
            
            {/* Customer Details Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="firstName">First Name <span className="text-error">*</span></label>
                <input 
                  {...register("firstName")}
                  className={`w-full bg-surface border ${errors.firstName ? 'border-error' : 'border-outline-variant'} rounded px-2.5 py-1.5 text-xs text-on-background transition-colors`} 
                  id="firstName" type="text" placeholder="e.g. John"
                />
                {errors.firstName && <p className="text-error text-[10px] mt-0.5">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="lastName">Last Name <span className="text-error">*</span></label>
                <input 
                  {...register("lastName")}
                  className={`w-full bg-surface border ${errors.lastName ? 'border-error' : 'border-outline-variant'} rounded px-2.5 py-1.5 text-xs text-on-background transition-colors`} 
                  id="lastName" type="text" placeholder="e.g. Doe"
                />
                {errors.lastName && <p className="text-error text-[10px] mt-0.5">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email & Newsletter Row */}
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <div className="flex-grow">
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="email">Email Address <span className="text-error">*</span></label>
                <input 
                  {...register("email")}
                  className={`w-full bg-surface border ${errors.email ? 'border-error' : 'border-outline-variant'} rounded px-2.5 py-1.5 text-xs text-on-background transition-colors`} 
                  id="email" placeholder="user@example.com" type="email"
                />
                {errors.email && <p className="text-error text-[10px] mt-0.5">{errors.email.message}</p>}
              </div>
              <div className="flex items-center gap-1.5 pb-1.5 shrink-0">
                <Checkbox id="newsletter" className="w-3.5 h-3.5" />
                <label className="text-xs text-muted-foreground cursor-pointer" htmlFor="newsletter">Email me with news and offers</label>
              </div>
            </div>

            {/* Address Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="address">Street Address <span className="text-error">*</span></label>
                <input 
                  {...register("street")}
                  className={`w-full bg-surface border ${errors.street ? 'border-error' : 'border-outline-variant'} rounded px-2.5 py-1.5 text-xs text-on-background transition-colors`} 
                  id="address" type="text" placeholder="123 Main St, Apt 4B"
                />
                {errors.street && <p className="text-error text-[10px] mt-0.5">{errors.street.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="city">City <span className="text-error">*</span></label>
                <input 
                  {...register("city")}
                  className={`w-full bg-surface border ${errors.city ? 'border-error' : 'border-outline-variant'} rounded px-2.5 py-1.5 text-xs text-on-background transition-colors`} 
                  id="city" type="text" placeholder="e.g. New York"
                />
                {errors.city && <p className="text-error text-[10px] mt-0.5">{errors.city.message}</p>}
              </div>
            </div>

            {/* Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="postalCode">Postal Code <span className="text-error">*</span></label>
                <input 
                  {...register("postalCode")}
                  className={`w-full bg-surface border ${errors.postalCode ? 'border-error' : 'border-outline-variant'} rounded px-2.5 py-1.5 text-xs text-on-background transition-colors`} 
                  id="postalCode" type="text" placeholder="10001"
                />
                {errors.postalCode && <p className="text-error text-[10px] mt-0.5">{errors.postalCode.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1" htmlFor="country">Country <span className="text-error">*</span></label>
                <Controller
                  control={control}
                  name="country"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className={`w-full bg-surface border ${errors.country ? 'border-error' : 'border-outline-variant'} h-[30px] rounded px-2.5 py-1.5 text-xs text-on-background transition-colors`}>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && <p className="text-error text-[10px] mt-0.5">{errors.country.message}</p>}
              </div>
            </div>

            {/* Payment Row */}
            <div className="pt-2 border-t border-surface-variant mt-1">
              <label className="block text-xs font-semibold text-on-surface-variant mb-2">Payment Method</label>
              <input type="hidden" {...register("paymentMethod")} value="cod" />
              <div className="flex items-center gap-2 p-2 bg-surface-container rounded border border-primary text-sm font-medium">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{fontVariationSettings: "'FILL' 1"}}>local_shipping</span>
                <span>Cash on Delivery (COD)</span>
                <span className="material-symbols-outlined text-primary text-[16px] ml-auto" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
              </div>
            </div>
            
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest border border-surface-variant p-4 rounded-lg lg:sticky lg:top-24 shadow-sm">
            <h2 className="text-base font-semibold text-on-background mb-3 pb-1 border-b border-surface-variant">Order Summary</h2>
            
            {/* Cart Items Dynamic Listing */}
            <div className="flex flex-col gap-2 mb-3 max-h-[160px] overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const product = item.product;
                const price = product.discountPrice || product.price;
                return (
                  <div key={item.id} className="flex gap-2 items-center">
                    <div className="w-10 h-10 bg-surface border border-surface-variant rounded flex items-center justify-center overflow-hidden shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={product.images[0] || '/placeholder.png'} 
                        alt={product.name}
                        className="object-cover w-full h-full mix-blend-multiply" 
                      />
                      <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xs font-medium text-on-background truncate" title={product.name}>{product.name}</h3>
                      <p className="text-[10px] text-muted-foreground truncate">{product.brand?.name || 'Electronica'}</p>
                    </div>
                    <div className="text-xs font-medium text-on-background text-right shrink-0">
                      ${(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code */}
            <div className="mb-3 border-y border-surface-variant py-2.5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-1.5 bg-primary/5 border border-primary/20 rounded">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>confirmation_number</span>
                    <div>
                      <span className="text-xs font-medium text-on-background">{appliedCoupon.code}</span>
                      <p className="text-[10px] text-primary">
                        {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}% off` 
                          : `$${appliedCoupon.discountValue.toFixed(2)} off`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-muted-foreground hover:text-error transition-colors p-0.5"
                    title="Remove coupon"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-1.5">
                    <input
                      className="flex-grow bg-surface border border-outline-variant rounded px-2 py-1 text-xs text-on-background transition-colors"
                      placeholder="Discount code"
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="bg-surface-container-high text-on-surface px-3 py-1 rounded text-xs font-medium hover:bg-surface-dim transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {couponLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-error text-[10px] mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">error</span>
                      {couponError}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Breakdown */}
            <div className="flex flex-col gap-1.5 mb-3">
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span>Subtotal</span>
                <span className="text-on-background">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-xs text-green-600">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span>Shipping</span>
                <span className="text-primary font-medium">Free</span>
              </div>
              <div className="flex justify-between items-center text-xs text-on-surface-variant">
                <span>Estimated Tax (8%)</span>
                <span className="text-on-background">${tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-base font-bold text-on-background mb-3 pt-2 border-t border-surface-variant">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {/* Submit Action */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-2 p-1.5 bg-error-container/50 border border-error/20 rounded flex items-center gap-1.5 text-error text-xs">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span className="font-medium">Please fill in all required fields</span>
              </div>
            )}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary py-2.5 rounded-full text-sm font-medium hover:bg-[#004ca3] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {isSubmitting ? 'Processing...' : 'Place Order'}
              {!isSubmitting && <span className="material-symbols-outlined text-[14px]">arrow_forward</span>}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
