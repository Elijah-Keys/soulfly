import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { InstagramFeed } from "@/components/InstagramFeed";
import { getFeaturedProducts } from "@/lib/products";
import heroImage from "@/assets/hero-soulfly.jpg";

const Index = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden pattern-444">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter animate-fade-up">
              SOULFLY
              <span className="text-gold block text-4xl md:text-5xl mt-2">444</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 italic font-light animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Never 2 fly 2 PRAY
            </p>
            <Link to="/shop">
              <Button size="lg" className="btn-444 shadow-gold animate-fade-up" style={{ animationDelay: '0.2s' }}>
                Shop Now
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-2">Featured Collection</h2>
              <p className="text-muted-foreground">Elevated essentials for the faithful</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/shop">
                <Button variant="outline" size="lg" className="btn-444">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <NewsletterSignup />

        {/* Instagram Feed */}
        <InstagramFeed />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
