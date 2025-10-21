// src/components/ShopGrid.tsx
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

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

export const ShopGrid = () => {
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/products`);
        if (!res.ok) throw new Error("API error");
        const list: ApiProduct[] = await res.json();
        setItems(list);
      } catch (e) {
        console.error("ShopGrid load error:", e);
        setItems([]); // empty fallback
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="py-12 text-center">Loading…</div>;

  if (!items.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No products yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
      {items.map((p) => (
        <ProductCard key={p.id} product={p as any} />
      ))}
    </div>
  );
};
export default ShopGrid;
