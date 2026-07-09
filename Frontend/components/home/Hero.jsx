import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative w-full bg-surface overflow-hidden pt-12 md:pt-20 pb-16 md:pb-32">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="flex flex-col items-start space-y-6 max-w-2xl">
            <div className="inline-flex items-center rounded-sm bg-surface-container border border-border px-3 py-1 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              New Era
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold tracking-tight text-foreground leading-[1.1]">
              Next-Gen Tech at Your Fingertips
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Experience engineered excellence. Discover our curated collection of premium electronics designed to elevate your digital lifestyle with unparalleled performance and minimalist aesthetics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
              <Button asChild size="lg" className="h-14 px-8 text-base bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-lg">
                <Link href="/products">Shop Now →</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base border-outline text-foreground hover:bg-surface-container-low transition-colors">
                <Link href="/categories">Explore Collection</Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-[400px] lg:h-[600px] w-full flex items-center justify-center animate-in fade-in slide-in-from-right-8 duration-1000">
            {/* Soft background glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl" />
            
            {/* The laptop image as seen in the Stitch design */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000" 
              alt="Premium Laptop"
              className="relative z-10 w-full max-w-[800px] object-contain drop-shadow-2xl scale-110 lg:scale-125 origin-center -ml-4 lg:ml-12"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
