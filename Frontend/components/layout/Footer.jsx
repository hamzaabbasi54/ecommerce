import Link from 'next/link';
import { Globe, Mail, MessageSquare, Share2, CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low text-on-surface border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:justify-between">
          
          {/* Column 1: Brand & Info */}
          <div className="space-y-6 lg:w-2/5 pr-8">
            <h2 className="text-2xl font-bold tracking-tight text-primary">Electronica</h2>
            <p className="text-muted-foreground text-sm leading-relaxed" style={{ minWidth: '250px' }}>
              Engineered Excellence. Delivering premium technology for the modern professional.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-12 lg:w-3/5 lg:justify-end lg:gap-24">
            {/* Column 2: Shop */}
            <div className="space-y-6 min-w-[150px]">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-on-surface">Shop</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link href="/products?sort=newest" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                <li><Link href="/products?sale=true" className="hover:text-primary transition-colors">Special Offers</Link></li>
                <li><Link href="/brands" className="hover:text-primary transition-colors">Shop by Brand</Link></li>
                <li><Link href="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div className="space-y-6 min-w-[150px]">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-on-surface">Support</h3>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="/support/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/support/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/support/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
                <li><Link href="/support/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Electronica, Engineered Excellence.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium tracking-widest border border-border px-2 py-0.5 rounded-sm">VISA</span>
            <span className="font-medium tracking-widest border border-border px-2 py-0.5 rounded-sm">MC</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
