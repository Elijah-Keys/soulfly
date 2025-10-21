// src/lib/api.ts
// src/lib/api.ts
const HOST =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

export const API =
  import.meta.env.VITE_API_URL || `http://${HOST}:3001`;

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

  return {
    id,
    name: p.name || "Untitled",
    description: p.description || "",
    images,
    price,
    priceId: p.priceId,
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    inventory: p.inventory || {},
    inStock: true,
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
