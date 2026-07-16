// Blog page — static content, rendered as a server component

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const MOCK_FEATURED_POST = {
  id: 1,
  title: 'The Future of Smart Home Devices in 2026',
  excerpt: 'Discover how artificial intelligence and seamless interoperability are transforming everyday appliances into proactive household assistants. From intelligent climate control to predictive maintenance, the smart home revolution is here.',
  category: 'Smart Home',
  author: 'Sarah Jenkins',
  date: 'Jul 12, 2026',
  imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1200&h=600',
};

const MOCK_POSTS = [
  {
    id: 2,
    title: 'Top 5 Noise-Canceling Headphones for Commuters',
    excerpt: 'We tested the latest models from Sony, Bose, and Sennheiser to find out which headphones offer the best sanctuary from city noise.',
    category: 'Audio',
    author: 'Mike Chen',
    date: 'Jul 08, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 3,
    title: 'Mechanical Keyboards: A Buyer\'s Guide',
    excerpt: 'Linear, tactile, or clicky? Navigating the world of mechanical switches can be daunting. Here is everything you need to know before your next upgrade.',
    category: 'Peripherals',
    author: 'Alex Rivera',
    date: 'Jul 05, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 4,
    title: 'Why 4K Gaming Monitors are Finally Affordable',
    excerpt: 'With new panel technologies hitting the market, high refresh rate 4K displays are no longer just for extreme enthusiasts. Here are our top budget picks.',
    category: 'Gaming',
    author: 'David Kim',
    date: 'Jul 01, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 5,
    title: 'Maximizing Your Laptop Battery Life',
    excerpt: 'Simple tweaks to your operating system and charging habits can significantly extend the lifespan and daily duration of your laptop battery.',
    category: 'Laptops',
    author: 'Emma Stone',
    date: 'Jun 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 6,
    title: 'The Rise of Foldable Smartphones',
    excerpt: 'Are foldables the future or just a passing trend? We dive into the durability, utility, and market adoption of the newest folding tech.',
    category: 'Smartphones',
    author: 'Sarah Jenkins',
    date: 'Jun 25, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=600&h=400',
  },
  {
    id: 7,
    title: 'Building a Budget Productivity Setup',
    excerpt: 'You don\'t need to spend thousands to have an ergonomic and efficient home office. Here are our favorite budget-friendly desk accessories.',
    category: 'Workstation',
    author: 'Mike Chen',
    date: 'Jun 20, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=600&h=400',
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Section */}
      <div className="bg-[#fcf9f8] border-b border-[#e5e5e5] py-12 md:py-20 mb-12">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary text-white hover:bg-primary/90 rounded-sm px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Our Journal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            Tech Insights & News
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with the latest trends, deep-dive reviews, and buying guides from the world of premium electronics.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Featured Post */}
        <div className="mb-16 group cursor-pointer">
          <div className="flex flex-col lg:flex-row gap-8 bg-white border border-[#e5e5e5] rounded overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300">
            <div className="lg:w-2/3 h-[300px] lg:h-[450px] overflow-hidden">
              <img 
                src={MOCK_FEATURED_POST.imageUrl} 
                alt={MOCK_FEATURED_POST.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="lg:w-1/3 p-8 lg:p-12 flex flex-col justify-center">
              <Badge className="w-fit mb-4 bg-[#dde6ff] text-primary hover:bg-[#dde6ff] rounded-sm font-bold uppercase tracking-widest text-[10px]">
                {MOCK_FEATURED_POST.category}
              </Badge>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                {MOCK_FEATURED_POST.title}
              </h2>
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {MOCK_FEATURED_POST.excerpt}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8">
                <div className="flex items-center gap-1.5">
                  <User size={14} />
                  <span className="font-semibold">{MOCK_FEATURED_POST.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{MOCK_FEATURED_POST.date}</span>
                </div>
              </div>

              <div className="mt-auto">
                <span className="inline-flex items-center text-primary font-bold text-sm group-hover:underline underline-offset-4">
                  Read Article <ArrowRight size={16} className="ml-2" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-foreground">Latest Articles</h3>
        </div>

        {/* Recent Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_POSTS.map((post) => (
            <div key={post.id} className="bg-white border border-[#e5e5e5] rounded overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 group cursor-pointer flex flex-col h-full">
              <div className="h-[240px] overflow-hidden relative">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-4 left-4 bg-white text-foreground hover:bg-white rounded-sm font-bold shadow-sm">
                  {post.category}
                </Badge>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <User size={12} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{post.date}</span>
                  </div>
                </div>
                <h4 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-4 border-t border-[#e5e5e5]">
                  <span className="text-primary font-bold text-xs uppercase tracking-wider flex items-center group-hover:underline underline-offset-4">
                    Continue Reading <ArrowRight size={14} className="ml-1" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Load More */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 bg-white border-2 border-primary text-primary font-bold rounded hover:bg-primary hover:text-white transition-colors">
            Load More Articles
          </button>
        </div>

      </div>
    </div>
  );
}
