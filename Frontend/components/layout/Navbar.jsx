'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Heart, ShoppingBag, Menu, LogOut, Settings, ChevronDown, Package } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useAuthStore from '@/context/useAuthStore';
import useCartStore from '@/hooks/useCart';
import useWishlistStore from '@/hooks/useWishlist';
import CartDrawer from '@/components/cart/CartDrawer';
import ProductSearch from '@/components/products/ProductSearch';
import axiosInstance from '@/utils/axiosInstance';
import { API_ROUTES } from '@/constants';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, initialize } = useAuthStore();
  const { cart, fetchCart, setDrawerOpen } = useCartStore();
  const { wishlist, fetchWishlist } = useWishlistStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(API_ROUTES.CATEGORIES);
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Initialize auth state on app load
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Handle sticky scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch cart and wishlist on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistItemsCount = wishlist?.length || 0;

  return (
    <>
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-white'
      }`}
    >
      {/* Tier 1: Top Info Bar */}
      <div className="w-full border-b border-[#e5e5e5] hidden md:block bg-white">
        <div className="max-w-[1000px] mx-auto px-4 h-10 flex items-center justify-between text-[13px] text-[#666666]">
          <div className="flex items-center gap-6">
            <Link href="/track-order" className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors pr-6 border-r border-[#e5e5e5]">
              <Package className="h-3.5 w-3.5" />
              <span>Track Order</span>
            </Link>
            <Link href="/support/shipping" className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
              <span>Returns Policy</span>
            </Link>
            <div className="flex items-center gap-4 pl-4 border-l border-[#e5e5e5]">
              <span>Follow Us</span>
              <div className="flex items-center gap-3 text-foreground">
                <Link href="#" className="text-[#666666] hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Link>
                <Link href="#" className="text-[#666666] hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </Link>
                <Link href="#" className="text-[#666666] hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </Link>
                <Link href="#" className="text-[#666666] hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:text-primary transition-colors outline-none cursor-pointer">
                <span>{isAuthenticated ? user?.name : 'Login / Register'}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/orders')}>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                    {user?.role === 'ADMIN' && (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Settings className="mr-2 h-4 w-4 text-primary" />
                        <span className="text-primary font-medium">Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/login')}>Log In</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/register')}>Register</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tier 2: Main Navigation Header */}
      <div className="container mx-auto px-4 h-[84px] flex items-center justify-between">
        {/* Left: Logo */}
        <div className="w-auto md:w-[240px] flex items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2">
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center">
            <span className="text-[32px] font-black tracking-tight text-foreground">
              Electronica<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <nav className="flex items-center gap-8 text-[15px] font-semibold text-foreground">
            <Link href="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/categories" className="flex items-center gap-1 hover:text-primary transition-colors">
              Category
            </Link>
            <Link href="/products" className="flex items-center gap-1 hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/blog" className="flex items-center gap-1 hover:text-primary transition-colors">
              Blog
            </Link>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="w-auto md:w-[240px] flex items-center justify-end gap-6">
          {/* Mobile User Icon */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'rounded-full' })}>
                {isAuthenticated && user?.profileImage ? (
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/login')}>Log In</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/register')}>Register</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button 
            onClick={() => router.push('/wishlist')}
            className="relative text-foreground hover:text-primary transition-colors"
          >
            <Heart className="h-[26px] w-[26px]" strokeWidth={1.5} />
            {wishlistItemsCount > 0 && (
              <Badge 
                className="absolute -top-1.5 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[9px] bg-primary text-white rounded-full border-none shadow-sm font-bold"
              >
                {wishlistItemsCount}
              </Badge>
            )}
            {wishlistItemsCount === 0 && (
              <Badge 
                className="absolute -top-1.5 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[9px] bg-[#e5e5e5] text-muted-foreground rounded-full border-none font-bold"
              >
                0
              </Badge>
            )}
          </button>

          <button 
            onClick={() => setDrawerOpen(true)}
            className="relative text-foreground hover:text-primary transition-colors"
          >
            <ShoppingBag className="h-[26px] w-[26px]" strokeWidth={1.5} />
            {cartItemsCount > 0 && (
              <Badge 
                className="absolute -top-1.5 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[9px] bg-primary text-white rounded-full border-none shadow-sm font-bold"
              >
                {cartItemsCount}
              </Badge>
            )}
            {cartItemsCount === 0 && (
              <Badge 
                className="absolute -top-1.5 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[9px] bg-[#e5e5e5] text-muted-foreground rounded-full border-none font-bold"
              >
                0
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Tier 3: Search & Categories Bar */}
      <div className="hidden lg:block pb-6">
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Left: Empty Spacer for Balance */}
          <div className="w-[240px]"></div>
          
          {/* Center: Categories Button + Search Bar */}
          <div className="flex-1 flex justify-center px-8">
            <div className="w-full max-w-[800px] flex items-center shadow-sm rounded">
              
              {/* All Categories Dropdown Button */}
              <div 
                className="relative w-[240px] h-[46px]"
                onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                onMouseLeave={() => setIsCategoryDropdownOpen(false)}
              >
                <Link href="/categories" onClick={() => setIsCategoryDropdownOpen(false)} className="w-full h-full bg-primary hover:bg-[#004ca3] text-white flex items-center px-5 font-bold text-[14px] rounded-l transition-colors cursor-pointer">
                  <Menu className="mr-3 h-[18px] w-[18px]" />
                  All Categories
                  <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </Link>
                
                {/* Hover Dropdown Menu */}
                <div className={`absolute top-full left-0 w-[240px] bg-white border border-[#e5e5e5] rounded-b shadow-lg z-50 flex-col py-2 ${isCategoryDropdownOpen ? 'flex' : 'hidden'}`}>
                  {categories.map((category) => (
                    <Link 
                      key={category.id} 
                      href={`/products?category=${category.slug}`}
                      onClick={() => setIsCategoryDropdownOpen(false)}
                      className="px-5 py-2.5 text-[14px] text-foreground hover:text-primary hover:bg-[#f8f8f8] transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                  {categories.length === 0 && (
                    <div className="px-5 py-3 text-[14px] text-muted-foreground">Loading categories...</div>
                  )}
                </div>
              </div>
              
              {/* Search Bar Component */}
              <div className="flex-1 h-[46px]">
                <ProductSearch variant="marketov2" />
              </div>
            </div>
          </div>

          {/* Right: Empty Spacer for Balance */}
          <div className="w-[240px] hidden xl:block">
          </div>

        </div>
      </div>
      
      {/* Mobile Search Bar */}
      <div className="lg:hidden p-3 border-t border-[#e5e5e5] bg-surface-container-lowest">
         <ProductSearch />
      </div>

    </header>

    {/* Cart Drawer */}
    <CartDrawer />
    </>
  );
}
