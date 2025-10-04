import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-store";
import { getProductById } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Truck, RotateCcw, Shield } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const product = getProductById(id || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addItem } = useCart();
  const { toast } = useToast();

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <Link to="/shop">
              <Button>Back to Shop</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive",
      });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: 1,
      image: product.images[0],
    });

    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedSize}) added to your cart.`,
    });
  };

  const inventory = product.inventory[selectedSize] || 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 py-12">
          {/* Breadcrumb */}
          <div className="mb-8 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link to="/shop" className="hover:text-foreground">Shop</Link>
            {' / '}
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="relative aspect-square rounded-4 overflow-hidden bg-card border mb-4">
                <Badge className="absolute top-4 right-4 z-10 badge-444 bg-gold text-gold-foreground">
                  444
                </Badge>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-semibold mb-6">${product.price}</p>
              
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Select Size</label>
                  {selectedSize && (
                    <span className="text-sm text-muted-foreground">
                      {inventory} in stock
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {product.sizes.map(size => {
                    const stock = product.inventory[size] || 0;
                    const isAvailable = stock > 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`
                          px-4 py-2 border rounded-4 font-medium transition-all
                          ${selectedSize === size 
                            ? 'border-gold bg-gold text-gold-foreground' 
                            : 'border-border hover:border-gold'
                          }
                          ${!isAvailable && 'opacity-30 cursor-not-allowed line-through'}
                        `}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="w-full btn-444 mb-8"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              {/* Features */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Free Shipping</h3>
                    <p className="text-sm text-muted-foreground">On orders over $100</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Easy Returns</h3>
                    <p className="text-sm text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gold mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Authenticity Guaranteed</h3>
                    <p className="text-sm text-muted-foreground">100% genuine products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16 border-t pt-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold mb-3">Care Instructions</h3>
                <p className="text-sm text-muted-foreground">
                  Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on low heat if needed.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Shipping Info</h3>
                <p className="text-sm text-muted-foreground">
                  Ships within 1-2 business days. Free shipping on orders over $100. Express shipping available.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Returns</h3>
                <p className="text-sm text-muted-foreground">
                  30-day return policy. Items must be unworn, unwashed, and in original packaging with tags attached.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
