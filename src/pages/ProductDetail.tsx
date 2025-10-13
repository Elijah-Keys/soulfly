import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { getProductById } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Truck, RotateCcw, Shield } from "lucide-react";
import { useEffect } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const product = getProductById(id || "");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { addItem } = useCart();
  const { toast } = useToast();
useEffect(() => {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}, []);
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-[#E8E9DF]">
        <Header />
        <main className="flex-1 bg-[#E8E9DF] flex items-center justify-center">
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
      toast({ title: "Please select a size", variant: "destructive" });
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
    toast({ title: "Added to cart", description: `${product.name} (${selectedSize}) added to your cart.` });
  };

  const inventory = product.inventory[selectedSize] || 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#E8E9DF]">{/* CHANGED */}
      <Header />

      <main className="flex-1 bg-[#E8E9DF]">{/* CHANGED */}
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-10 md:py-16">
          {/* Breadcrumb */}
          <div className="mb-8 text-sm text-neutral-500">
            <Link to="/" className="hover:text-neutral-900">Home</Link>
            {" / "}
            <Link to="/shop" className="hover:text-neutral-900">Shop</Link>
            {" / "}
            <span className="text-neutral-900">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Image */}
            <div>
              <div className="relative bg-[#E8E9DF] overflow-hidden aspect-[4/3]">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="text-[11px] tracking-[0.22em] text-neutral-500 uppercase mb-3">
                Soulfly
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
                {product.name}
              </h1>

              <p className="text-2xl md:text-3xl font-medium mb-8">
                ${product.price.toFixed(2)} USD
              </p>

              <p className="text-neutral-600 mb-10 leading-relaxed">
                {product.description}
              </p>

              {/* Sizes */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-semibold">Select Size</label>
                  {selectedSize && (
                    <span className="text-sm text-neutral-500">{inventory} in stock</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const stock = product.inventory[size] || 0;
                    const isAvailable = stock > 0;
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`px-4 py-2 border border-neutral-300 rounded-none text-sm tracking-wide transition-colors
                          ${selectedSize === size ? "bg-[#00C853] text-white" : "hover:bg-neutral-100"}
                          ${!isAvailable ? "opacity-30 cursor-not-allowed line-through" : ""}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add to cart */}
              <Button
                size="lg"
                className="w-full rounded-none bg-[#00C853] text-white hover:bg-white hover:text-black hover:border hover:border-black transition-colors mb-10"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>

              {/* Minimal feature list */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-neutral-700 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Free shipping over $100</h3>
                    <p className="text-sm text-neutral-500">Standard and express available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-neutral-700 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">30 day returns</h3>
                    <p className="text-sm text-neutral-500">Items must be unworn with tags</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-neutral-700 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Authenticity</h3>
                    <p className="text-sm text-neutral-500">Designed by Soulfly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info blocks */}
          <div className="mt-20 grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="font-semibold mb-3">Care</h3>
              <p className="text-sm text-neutral-500">
                Machine wash cold with like colors. Tumble dry low. Do not bleach.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Shipping</h3>
              <p className="text-sm text-neutral-500">
                Ships in 1 to 2 business days. Free shipping over $100.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Returns</h3>
              <p className="text-sm text-neutral-500">
                30 day returns. Items must be unworn and in original packaging.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
