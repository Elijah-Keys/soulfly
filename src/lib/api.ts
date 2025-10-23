// src/lib/api.ts  (one copy, one paste)
export const API =
  (import.meta && import.meta.env && import.meta.env.PROD)
    ? "https://api.soulfly444.com"
    : "http://localhost:3001";

export const resolveImg = (u?: string) =>
  !u ? "" : u.startsWith("http") ? u : `${API}${u.startsWith("/") ? "" : "/"}${u}`;

export type ApiProduct = {
  id?: string;
  slug?: string;
  name: string;
  description?: string;
  image?: string;
  images?: string[];
  priceId?: string;
  unit_amount?: number;
  currency?: string;
  sizes?: string[];
  inventory?: Record<string, number>;
  category?: string;
};

export type UIProduct = {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  priceId?: string;
  sizes: string[];
  inventory: Record<string, number>;
  inStock: boolean;
  category?: string;
};

export function toUIProduct(p: ApiProduct): UIProduct {
  const id = (p.slug || p.id || "").toString();
  const images = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
  const price = typeof p.unit_amount === "number" ? p.unit_amount / 100 : 0;

  const inventory = p.inventory || {};
  const sizes =
    (Array.isArray(p.sizes) && p.sizes.length ? p.sizes : Object.keys(inventory)) || [];
  const total = Object.values(inventory).reduce(
    (sum, n) => sum + (typeof n === "number" ? n : 0),
    0
  );
  const inStock = sizes.length ? total > 0 : true;

  return {
    id,
    name: p.name || "Untitled",
    description: p.description || "",
    images,
    price,
    priceId: p.priceId,
    sizes,
    inventory,
    inStock,
    category: p.category,
  };
}

export async function fetchProducts(): Promise<UIProduct[]> {
  const res = await fetch(`${API}/api/products`);
  if (!res.ok) throw new Error(`GET /api/products failed (${res.status})`);
  const data = await res.json();
  const arr = Array.isArray(data) ? data : [];
  return arr.map(toUIProduct);
}
