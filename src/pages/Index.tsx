import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { InstagramFeed } from "@/components/InstagramFeed";
import { getFeaturedProducts, products } from "@/lib/products";
import heroImage from "@/assets/hero-soulfly.jpg";

const Index = () => {
  const featuredProducts = getFeaturedProducts();
  const [showAll, setShowAll] = useState(false);
  const visibleProducts = showAll ? products : featuredProducts;

  const scrollToShop = () => {
    const el = document.getElementById("shop");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
  <div className="min-h-screen flex flex-col bg-[#E8E9DA] text-black">
      <Header />

      <main className="flex-1">
        {/* Hero: left copy, right portrait image */}
   <section className="relative mt-12">
          <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-start pt-16 md:pt-24">
            {/* Copy column */}
<div className="order-2 md:order-1 max-w-xl relative">
  {/* STICKY text + button */}
  <div className="md:sticky md:top-24">
    <p className="uppercase tracking-[0.22em] text-xs text-neutral-500 mb-8">
      Sitewide sale. All items available now will not be returning after Oct 4, 2025
    </p>

<blockquote className="mb-12 italic text-lg md:text-xl leading-snug text-neutral-800">
  Never <span className="text-[#00C853] font-semibold">2</span> Fly <span className="text-[#00C853] font-semibold">2</span> Pray
</blockquote>



<h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-8">
  Designed by{" "}
  <span className="font-allura font-normal leading-none">Soulfly</span>
 <span className="font-dancing text-[#00C853] ml-2 leading-none text-[0.4em]">444</span>
</h1>



    <p className="text-neutral-600 mb-12">
      Studio silhouettes. Quiet textures. Elevated street pieces for the faithful.
    </p>

    <Button
      onClick={scrollToShop}
      size="lg"
      className="rounded-none border border-transparent bg-[#00C853] text-white px-8 py-6 hover:bg-white hover:text-black transition-colors"
    >
      Shop Now
    </Button>
  </div>

  {/* 444 motif BELOW the text (not sticky) */}
 <div aria-hidden style={{ marginTop: "-400px" }} className="flex flex-col gap-8 pointer-events-none select-none">
    <span className="font-dancing block text-[#00C853] opacity-[0.1] text-[9rem] md:text-[18rem] leading-none tracking-tight">
      444
    </span>
    <span className="font-dancing block text-[#00C853] opacity-[0.1] text-[9rem] md:text-[18rem] leading-none tracking-tight">
      444
    </span>
    <span className="font-dancing block text-[#00C853] opacity-[0.1] text-[9rem] md:text-[18rem] leading-none tracking-tight">
      444
    </span>
  </div>
</div>




              {/* Image column */}
              <div className="order-1 md:order-2">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                  <img
                    src={heroImage}
                    alt="Soulfly studio portrait"
                    className="h-full w-full object-cover grayscale contrast-110"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

{/* Featured products */}
<section id="shop" className="pt-14 md:pt-20 pb-16 scroll-mt-24 md:scroll-mt-28">
  {/* Heading with normal gutters */}
  <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 mb-6">
    <h2 className="text-2xl md:text-3xl font-semibold tracking-wide uppercase">
      {showAll ? "All Products" : "All Products"}
    </h2>
    <p className="text-neutral-500 mt-2">Studio grade essentials</p>
  </div>

  {/* Grid wrapper: near edge, tiny safe gutters */}
  <div
    className="w-full mx-auto max-w-none"
    style={{
      paddingLeft: "12px",
      paddingRight: "12px"
      // If you want iOS safe areas, swap to:
      // paddingLeft: "max(env(safe-area-inset-left),12px)",
      // paddingRight: "max(env(safe-area-inset-right),12px)",
    }}
  >
{/* Grid wrapper: full width with 16px side padding, middle gap unchanged */}
<div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw]">
  <div
    style={{
      paddingLeft: "16px",
      paddingRight: "16px",
      // keep safe areas if you want
      // paddingLeft: "max(env(safe-area-inset-left),16px)",
      // paddingRight: "max(env(safe-area-inset-right),16px)",
    }}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-4">
      {visibleProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>  

    <div className="text-center mt-8">
<Button
  size="lg"
  className="rounded-none px-8 py-6 border border-transparent bg-[#00C853] text-white hover:bg-white hover:text-black transition-colors"
  onClick={() => setShowAll((v) => !v)}
>
  {showAll ? "Show Less" : "Shop All"}
</Button>

    </div>
  </div>
</div>
</div>
</section>


        <NewsletterSignup />
        <InstagramFeed />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
