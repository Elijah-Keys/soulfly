import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { products as seed } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Shape from the API
type ApiProduct = {
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

// UI product we pass to cards (category may come from seed)
type UIProduct = ApiProduct & { category?: string };

export default function Shop() {
  const [items, setItems] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
const [refreshKey, setRefreshKey] = useState(0);

  // Fetch from API, then merge with seed metadata (category, fallback images/sizes, etc.)
useEffect(() => {
  (async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      if (!res.ok) throw new Error("API error");
      const apiList: ApiProduct[] = await res.json();

      // merge API product with any matching seed meta
      const merged: UIProduct[] = apiList.map((p) => {
        const meta: any = seed.find((s: any) => String(s.id) === String(p.id)) || {};
        return {
          category: meta.category ?? "All",
          ...meta,
          ...p,
          images: p.images?.length ? p.images : meta.images || [],
          sizes: p.sizes?.length ? p.sizes : meta.sizes || [],
          inventory: p.inventory || meta.inventory || {},
          inStock: typeof p.inStock === "boolean" ? p.inStock : meta.inStock ?? true,
        };
      });

      // ✅ UNION with seed so seed-only items still show
      const present = new Set(merged.map((p) => String(p.id)));
      const seedOnly: UIProduct[] = (seed as any[])
        .filter((s) => !present.has(String(s.id)))
        .map((s) => ({
          ...s,
          category: s.category ?? "All",
          images: s.images || [],
          sizes: s.sizes || [],
          inventory: s.inventory || {},
          inStock: s.inStock ?? true,
        }));

      setItems([...merged, ...seedOnly]);
    } catch {
      setItems(seed as unknown as UIProduct[]);
    } finally {
      setLoading(false);
    }
  })();
}, [refreshKey]); // 🔁 rerun when refreshKey changes


  // Build filter options from loaded items
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((p) => p.category || "All")
            .filter(Boolean)
        )
      ),
    [items]
  );

  const allSizes = useMemo(() => {
    const s = new Set<string>();
    items.forEach((p) => (p.sizes || []).forEach((sz) => s.add(sz)));
    return Array.from(s);
  }, [items]);

  // Apply filters
  const filteredProducts = items.filter((product) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category || "All")) return false;
    if (selectedSizes.length > 0 && !(product.sizes || []).some((s: string) => selectedSizes.includes(s))) return false;
    if (inStockOnly && !product.inStock) return false;
    return true;
  });

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Category</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedCategories((prev) => [...prev, category]);
                  else setSelectedCategories((prev) => prev.filter((c) => c !== category));
                }}
              />
              <Label htmlFor={`cat-${category}`} className="text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-semibold mb-3">Size</h3>
        <div className="space-y-2">
          {(allSizes.length ? allSizes : ["S", "M", "L", "XL", "XXL"]).map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={selectedSizes.includes(size)}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedSizes((prev) => [...prev, size]);
                  else setSelectedSizes((prev) => prev.filter((s) => s !== size));
                }}
              />
              <Label htmlFor={`size-${size}`} className="text-sm cursor-pointer">
                {size}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* In Stock */}
      <div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(!!checked)}
          />
          <Label htmlFor="in-stock" className="text-sm cursor-pointer">
            In Stock Only
          </Label>
        </div>
      </div>

      {/* Clear Filters */}
      {(selectedCategories.length > 0 || selectedSizes.length > 0 || inStockOnly) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedCategories([]);
            setSelectedSizes([]);
            setInStockOnly(false);
          }}
        >
          Clear All Filters
        </Button>
        
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pattern-444">
        <div className="container px-4 py-12 relative z-10">
          <div className="mx-auto max-w-6xl">
            {/* Header row */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Shop All</h1>
                <p className="text-muted-foreground">
                  {loading ? "Loading…" : `${filteredProducts.length} ${filteredProducts.length === 1 ? "product" : "products"}`}
                </p>
              </div>

              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
<Button
  variant="outline"
  className="hidden lg:inline-flex"
  onClick={() => setRefreshKey((k) => k + 1)}
>
  Refresh
</Button>

            {/* Main Content */}
            <div className="flex gap-8">
              {/* Desktop Filters (intentionally hidden for your wide layout) */}
              <aside className="hidden w-64 shrink-0">
                <div className="sticky top-24">
                  <h2 className="text-lg font-semibold mb-4">Filters</h2>
                  <FilterPanel />
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {loading ? (
                  <div className="py-12">Loading…</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
                      {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product as any} />
                      ))}
                    </div>

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No products found matching your filters.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
