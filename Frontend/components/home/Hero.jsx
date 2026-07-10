import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full h-[600px] md:h-[720px] bg-surface-container-lowest overflow-hidden flex items-center border-b border-outline-variant">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          className="w-full h-full object-cover opacity-90 object-right-bottom md:object-center" 
          alt="Premium Tech Ecosystem" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE3v_0xCU5GSRrRnnt-vjsm-qoEVV9obrSWnULl07z0MgsG38oFvusXQVIg6vi83T9Cp4QiWlc-QwGkcIwwtUOJQ3_hb1U-nfJ1oNrGML95rQ93JjftAX_al8L2Jimc8_rsTNm0m6uGx9oTdYI1aOMm2Vio6Y22AlieBhVvAT6esB5tz5BHzX5FBasPkhghfBp801shUPky5JvuijS2EqFEvj3UlnIJNe4av5aV1yi9ASxOORjIZdn1A"
        />
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
      </div>
      
      <div className="relative max-w-container-max mx-auto px-margin-desktop md:px-margin-desktop w-full z-10 flex flex-col justify-center">
        <div className="max-w-[42rem]">
          <span className="inline-block py-xs px-sm bg-surface-container-high border border-outline-variant rounded font-label-sm text-label-sm text-on-surface-variant mb-md tracking-widest uppercase">
            New Era
          </span>
          <h1 className="font-h1-mobile md:font-h1 text-h1-mobile md:text-h1 text-on-surface mb-lg">
            Next-Gen Tech at Your Fingertips
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-[32rem]">
            Experience engineered excellence. Discover our curated collection of premium electronics designed to elevate your digital lifestyle with unparalleled performance and minimalist aesthetics.
          </p>
          <div className="flex gap-md">
            <Link href="/products" className="bg-primary text-on-primary font-button text-button py-md px-lg rounded flex items-center gap-sm hover:bg-surface-tint transition-colors">
              Shop Now
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </Link>
            <Link href="/categories" className="bg-transparent border border-outline text-on-surface font-button text-button py-md px-lg rounded hover:bg-surface-container-low transition-colors">
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
