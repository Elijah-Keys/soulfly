// src/pages/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { getProductById } from "@/lib/products"; // fallback only
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Truck, RotateCcw, Shield } from "lucide-react";
import { ToastAction } from "@/components/ui/toast";
import { useNavigate } from "react-router-dom";

import { API, resolveImg } from "@/lib/api";

const TEST_PRICE_ID = "price_1SII1h7pABZIRK495XNnk7ZT"; // fallback if no priceId

// 👇 add this helper:
function toUI(p: any) {
  const id = String(p.slug || p.id || "");
  const images =
    Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : [];
  const sizes = Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ["OS"];
  const inventory = p.inventory || {};
  const price =
    typeof p.unit_amount === "number" ? p.unit_amount / 100 : Number(p.price || 0);
  const priceId =
    p.priceId || (p.default_price && typeof p.default_price === "string" ? p.default_price : undefined);
  const inStock = typeof p.inStock === "boolean" ? p.inStock : true; // <-- add this

  return {
    id,
    name: p.name || "Untitled",
    description: p.description || "",
    price,
    priceId,
    images,
    sizes,
    inventory,
    inStock,
  } as Product;
}


type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceId?: string;
  images: string[];
  sizes: string[];
  inventory: Record<string, number>;
  inStock: boolean;
};

export default function ProductDetail() {
  const { id = "" } = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");


  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // Load product from API, fall back to static list if not found / error
useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      // Try item endpoint first
      const res = await fetch(`${API}/api/products/${id}`);
      if (res.ok) {
        const raw = await res.json();
        if (!cancelled) {
          const norm = toUI(raw);
          setProduct(norm);
          setSelectedSize(norm.sizes?.[0] || ""); // auto-pick first size
        }
        return;
      }

      // If that route doesn’t exist, fetch list and find the item
      if (res.status === 404 || res.status === 405) {
        const list = await fetch(`${API}/api/products`).then(r => r.json());
        const found = Array.isArray(list)
          ? list.find((p: any) => (p.slug || p.id) === id)
          : null;

        if (!cancelled) {
          if (found) {
            const norm = toUI(found);
            setProduct(norm);
            setSelectedSize(norm.sizes?.[0] || "");
          } else {
            const local = getProductById(id);
            setProduct(local ? toUI(local) : null);
            if (local) setSelectedSize(local.sizes?.[0] || "");
          }
        }
        return;
      }

      // Other non-OK → fallback to local
      const local = getProductById(id);
      if (!cancelled) {
        setProduct(local ? toUI(local) : null);
        if (local) setSelectedSize(local.sizes?.[0] || "");
      }
    } catch {
      const local = getProductById(id);
      if (!cancelled) {
        setProduct(local ? toUI(local) : null);
        if (local) setSelectedSize(local.sizes?.[0] || "");
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  load();
  return () => {
    cancelled = true;
  };
}, [id]);



  const inventoryForSize = product?.inventory?.[selectedSize] ?? 0;

function handleAddToCart() {
  if (!product) return;

  // pick a size if none selected
  const size = selectedSize || product.sizes?.[0] || "OS";
  if (!size) {
    toast({ title: "Please select a size", variant: "destructive" });
    return;
  }
  if (size !== selectedSize) setSelectedSize(size);

  // safe priceId
  const priceId = product.priceId || TEST_PRICE_ID;

 addItem({
    productId: product.id,
    priceId,
    name: product.name,
    price: product.price,
    size,                 // ✅ use local size
    quantity: 1,
image: resolveImg(product.images?.[0]) || "",
  });

toast({
  title: "Added to cart",
  description: `${product.name} (${size}) added to your cart.`,
  duration: 3000,
  onClick: () => navigate("/cart", { state: { scrollTop: true } }), // 👈 add state flag
});
}

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#E8E9DF]">
        <Header />
        <main className="flex-1 bg-[#E8E9DF] grid place-items-center p-10">
          <div>Loading…</div>
        </main>
        <Footer />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen flex flex-col bg-[#E8E9DF]">
      <Header />
   <main className="flex-1 bg-[#E8E9DF] pt-20 md:pt-0">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-10 md:py-16">
          {/* Breadcrumb */}
          <div className="mb-8 text-sm text-neutral-500">
            <Link to="/" className="hover:text-neutral-900">Home</Link>{" / "}
            <Link to="/shop" className="hover:text-neutral-900">Shop</Link>{" / "}
            <span className="text-neutral-900">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Image */}
            <div>
              <div className="relative bg-[#E8E9DF] overflow-hidden aspect-[4/3]">
          <img
  src={resolveImg(product.images?.[0]) || "/placeholder.png"}
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
               {selectedSize && product.inventory?.[selectedSize] !== undefined && (
  <span className="text-sm text-neutral-500">
    {product.inventory[selectedSize]} in stock
  </span>
)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes || []).map((size) => {
              const stock = product.inventory?.[size];
const isAvailable = stock === undefined ? true : stock > 0;
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
}
