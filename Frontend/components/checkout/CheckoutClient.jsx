"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import useCartStore from "@/hooks/useCart";
import Link from "next/link";
import { Loader2 } from "lucide-react";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      country: "United States",
      paymentMethod: "credit_card",
    }
  });

  const cartItems = cart?.items || [];
  
  let subtotal = 0;
  cartItems.forEach((item) => {
    const price = item.product.discountPrice || item.product.price;
    subtotal += price * item.quantity;
  });

  const taxRate = 0.08;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const onSubmit = async (data) => {
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
          paymentMethod: data.paymentMethod
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
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-xl">
      <div className="mb-lg">
        <h1 className="font-h2 text-h2 text-on-background">Secure Checkout</h1>
        <p className="font-body-md text-body-md text-muted-foreground mt-sm">Complete your purchase with precision.</p>
      </div>

      {submitError && (
        <div className="mb-lg p-md bg-error-container text-on-error-container rounded border border-error/20">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-xl relative">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 flex flex-col gap-lg">
          
          {/* Contact Section */}
          <section className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg">
            <h2 className="font-h4 text-h4 text-on-background mb-md">Contact Information</h2>
            <div className="flex flex-col gap-md">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="email">Email Address</label>
                <input 
                  {...register("email")}
                  className={`w-full bg-surface border ${errors.email ? 'border-error' : 'border-outline-variant'} rounded p-sm font-body-md text-body-md text-on-background transition-colors`} 
                  id="email" 
                  placeholder="user@example.com" 
                  type="email"
                />
                {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
              </div>
              <div className="flex items-center gap-sm mt-xs">
                <input className="w-4 h-4 text-primary border-outline-variant rounded accent-primary cursor-pointer" id="newsletter" type="checkbox" />
                <label className="font-body-md text-body-md text-muted-foreground cursor-pointer" htmlFor="newsletter">Email me with news and offers</label>
              </div>
            </div>
          </section>

          {/* Shipping Section */}
          <section className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg">
            <h2 className="font-h4 text-h4 text-on-background mb-md">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="firstName">First Name</label>
                <input 
                  {...register("firstName")}
                  className={`w-full bg-surface border ${errors.firstName ? 'border-error' : 'border-outline-variant'} rounded p-sm font-body-md text-body-md text-on-background transition-colors`} 
                  id="firstName" type="text"
                />
                {errors.firstName && <p className="text-error text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="lastName">Last Name</label>
                <input 
                  {...register("lastName")}
                  className={`w-full bg-surface border ${errors.lastName ? 'border-error' : 'border-outline-variant'} rounded p-sm font-body-md text-body-md text-on-background transition-colors`} 
                  id="lastName" type="text"
                />
                {errors.lastName && <p className="text-error text-sm mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            
            <div className="mb-md">
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="address">Street Address</label>
              <input 
                {...register("street")}
                className={`w-full bg-surface border ${errors.street ? 'border-error' : 'border-outline-variant'} rounded p-sm font-body-md text-body-md text-on-background transition-colors`} 
                id="address" type="text"
              />
              {errors.street && <p className="text-error text-sm mt-1">{errors.street.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
              <div className="md:col-span-2">
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="city">City</label>
                <input 
                  {...register("city")}
                  className={`w-full bg-surface border ${errors.city ? 'border-error' : 'border-outline-variant'} rounded p-sm font-body-md text-body-md text-on-background transition-colors`} 
                  id="city" type="text"
                />
                {errors.city && <p className="text-error text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="postalCode">Postal Code</label>
                <input 
                  {...register("postalCode")}
                  className={`w-full bg-surface border ${errors.postalCode ? 'border-error' : 'border-outline-variant'} rounded p-sm font-body-md text-body-md text-on-background transition-colors`} 
                  id="postalCode" type="text"
                />
                {errors.postalCode && <p className="text-error text-sm mt-1">{errors.postalCode.message}</p>}
              </div>
            </div>

            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="country">Country</label>
              <select 
                {...register("country")}
                className={`w-full bg-surface border ${errors.country ? 'border-error' : 'border-outline-variant'} rounded p-sm font-body-md text-body-md text-on-background transition-colors appearance-none cursor-pointer`} 
                id="country"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
              </select>
              {errors.country && <p className="text-error text-sm mt-1">{errors.country.message}</p>}
            </div>

            <div className="mt-lg pt-md border-t border-surface-variant flex items-center gap-sm">
              <input defaultChecked className="w-4 h-4 text-primary border-outline-variant rounded accent-primary cursor-pointer" id="sameAsBilling" type="checkbox" />
              <label className="font-body-md text-body-md text-on-background cursor-pointer" htmlFor="sameAsBilling">Billing address is same as shipping</label>
            </div>
          </section>

          {/* Payment Section */}
          <section className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg">
            <h2 className="font-h4 text-h4 text-on-background mb-md">Payment Method</h2>
            <p className="font-label-sm text-label-sm text-muted-foreground mb-md flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings: "'FILL' 1"}}>lock</span>
              All transactions are secure and encrypted.
            </p>
            <div className="flex flex-col gap-sm">
              
              {/* Credit Card Option */}
              <label className="flex items-center justify-between p-md border border-primary rounded bg-surface-container cursor-pointer transition-colors">
                <div className="flex items-center gap-sm">
                  <input 
                    {...register("paymentMethod")} 
                    value="credit_card"
                    className="w-4 h-4 text-primary accent-primary cursor-pointer" 
                    type="radio"
                  />
                  <span className="font-body-md text-body-md font-medium text-on-background">Credit Card</span>
                </div>
                <div className="flex gap-xs text-muted-foreground">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>credit_card</span>
                </div>
              </label>

              {/* CC Details (Dummy for visual purposes) */}
              <div className="p-md border border-t-0 border-outline-variant rounded-b bg-surface-container-lowest -mt-sm pt-lg">
                <div className="mb-md">
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="cardNumber">Card Number</label>
                  <input className="w-full bg-surface border border-outline-variant rounded p-sm font-body-md text-body-md text-on-background transition-colors" id="cardNumber" placeholder="0000 0000 0000 0000" type="text" />
                </div>
                <div className="grid grid-cols-2 gap-md">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="expDate">Expiration Date (MM/YY)</label>
                    <input className="w-full bg-surface border border-outline-variant rounded p-sm font-body-md text-body-md text-on-background transition-colors" id="expDate" placeholder="MM / YY" type="text" />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs" htmlFor="cvv">Security Code</label>
                    <input className="w-full bg-surface border border-outline-variant rounded p-sm font-body-md text-body-md text-on-background transition-colors" id="cvv" placeholder="CVV" type="text" />
                  </div>
                </div>
              </div>

              {/* PayPal Option */}
              <label className="flex items-center justify-between p-md border border-outline-variant rounded hover:bg-surface-container-low cursor-pointer transition-colors mt-sm">
                <div className="flex items-center gap-sm">
                  <input 
                    {...register("paymentMethod")}
                    value="paypal"
                    className="w-4 h-4 text-primary accent-primary cursor-pointer" 
                    type="radio" 
                  />
                  <span className="font-body-md text-body-md font-medium text-on-background">PayPal</span>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest border border-surface-variant p-lg rounded-lg lg:sticky lg:top-32">
            <h2 className="font-h4 text-h4 text-on-background mb-lg pb-sm border-b border-surface-variant">Order Summary</h2>
            
            {/* Cart Items Dynamic Listing */}
            <div className="flex flex-col gap-md mb-lg max-h-80 overflow-y-auto pr-sm">
              {cartItems.map((item) => {
                const product = item.product;
                const price = product.discountPrice || product.price;
                return (
                  <div key={item.id} className="flex gap-md items-center">
                    <div className="w-16 h-16 bg-surface border border-surface-variant rounded flex items-center justify-center overflow-hidden shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={product.images[0] || '/placeholder.png'} 
                        alt={product.name}
                        className="object-cover w-full h-full mix-blend-multiply" 
                      />
                      <span className="absolute -top-2 -right-2 bg-secondary text-on-secondary w-5 h-5 rounded-full flex items-center justify-center font-label-sm text-label-sm text-[10px]">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-body-md text-body-md font-medium text-on-background truncate" title={product.name}>{product.name}</h3>
                      <p className="font-label-sm text-label-sm text-muted-foreground mt-xs truncate">{product.brand?.name || 'Electronica'}</p>
                    </div>
                    <div className="font-body-md text-body-md text-on-background text-right shrink-0">
                      ${(price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code */}
            <div className="flex gap-sm mb-lg border-y border-surface-variant py-md">
              <input className="flex-grow bg-surface border border-outline-variant rounded p-sm font-body-md text-body-md text-on-background transition-colors" placeholder="Discount code" type="text" />
              <button type="button" className="bg-surface-container-high text-on-surface px-md py-sm rounded font-button text-button hover:bg-surface-dim transition-colors">Apply</button>
            </div>

            {/* Breakdown */}
            <div className="flex flex-col gap-sm mb-lg">
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Subtotal</span>
                <span className="text-on-background">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Shipping</span>
                <span className="text-primary font-medium">Free</span>
              </div>
              <div className="flex justify-between items-center font-body-md text-body-md text-on-surface-variant">
                <span>Estimated Tax (8%)</span>
                <span className="text-on-background">${tax.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center font-h3 text-h3 text-on-background mb-lg pt-md border-t border-surface-variant">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {/* Submit Action */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary text-on-primary py-md rounded-lg font-button text-button hover:bg-surface-tint active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-50 disabled:active:scale-100"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isSubmitting ? 'Processing...' : 'Place Order'}
              {!isSubmitting && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
