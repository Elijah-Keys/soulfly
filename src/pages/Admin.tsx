// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit3 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { API, resolveImg } from "@/lib/api";

const ENV_ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || "";

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

export default function Admin() {
  const { toast } = useToast();

  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
// Restore saved admin key so we keep sending it after refresh/navigation
useEffect(() => {
  const k = sessionStorage.getItem("adminKey");
  if (k) {
    setPassword(k);
    setAuthenticated(true);
  }
}, []);

  // Data
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Create form visibility/state
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create form state
  const [form, setForm] = useState<Partial<Product>>({
    id: "",
    name: "",
    description: "",
    price: 0,
    priceId: "",
    images: [],
    sizes: [],
    inventory: {},
    inStock: true,
  });

 // replace your current sizes/inventory state with:
const [sizesInput, setSizesInput] = useState<string>("S,M,L,XL");
const [deletingId, setDeletingId] = useState<string | null>(null);
// live inventory map built from numeric inputs, auto-serialized to JSON on submit
const [inventoryMap, setInventoryMap] = useState<Record<string, number>>({
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
});
function parseSizes(csv: string): string[] {
  return csv.split(",").map(s => s.trim()).filter(Boolean);
}

function syncInventoryWithSizes(csv: string) {
  const sizes = parseSizes(csv);
  setForm(f => ({ ...f, sizes }));
  setInventoryMap(prev => {
    const next: Record<string, number> = {};
    sizes.forEach(s => { next[s] = Number(prev[s] ?? 0); });
    return next;
  });
}
useEffect(() => {
  if (authenticated) {
    // keep form sizes in sync with default "S,M,L,XL"
    syncInventoryWithSizes(sizesInput);
  }
}, [authenticated]);


  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

  // Inline stock editor for existing products
const [editingStockId, setEditingStockId] = useState<string | null>(null);
const [editSizes, setEditSizes] = useState<string[]>([]);
const [editInv, setEditInv] = useState<Record<string, number>>({});


  const location = useLocation();
async function uploadImage(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API}/api/admin/upload`, {
    method: "POST",
    headers: {
      "x-admin-key": password,
      "Accept": "application/json",
    },
    body: fd,
  });

  // Read raw (server might send HTML on errors)
  const raw = await res.text();
  let data: any = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch {}

  if (!res.ok) {
    // Friendlier messages for common cases
    if (res.status === 401) throw new Error("Unauthorized (bad admin key). Re-enter the key.");
    if (res.status === 413) throw new Error("File too large (server limit ~10MB). Try a smaller image.");
    throw new Error(data?.error || `Upload failed (HTTP ${res.status})`);
  }

  const url = data?.url;
  if (!url) throw new Error("Upload response missing URL");
  return String(url); // e.g. "/images/foo.webp"
}


  function removeImageAt(idx: number) {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast({
        title: "Load failed",
        description: e.message || String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Open the form if URL has #add
  useEffect(() => {
    if (location.hash === "#add") {
      setShowAdd(true);
      setTimeout(() => {
        document
          .getElementById("add-form")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [location.hash]);

  // Little debug helpers
  useEffect(() => {
    (window as any).__openAdd = () => setShowAdd(true);
    (window as any).__closeAdd = () => setShowAdd(false);
  }, []);

  useEffect(() => {
    if (authenticated) load();
  }, [authenticated]);

function handleLogin(e: React.FormEvent) {
  e.preventDefault();
  if (password && ENV_ADMIN_KEY && password === ENV_ADMIN_KEY) {
    setAuthenticated(true);
    sessionStorage.setItem("adminKey", password); // <-- persist
    toast({ title: "Welcome", description: "Admin unlocked" });
  } else {
    toast({ title: "Incorrect admin key", variant: "destructive" });
  }
}


  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
// Build sizes from form.sizes or CSV, and use numeric inventoryMap
const sizes = form.sizes && form.sizes.length
  ? form.sizes
  : parseSizes(sizesInput);

const inventory = inventoryMap;
const inStock = Object.values(inventory).some((n) => Number(n) > 0);


      const payload = {
        id: String(form.id || "").trim(),
        name: String(form.name || "").trim(),
        description: String(form.description || ""),
        price: Number(form.price || 0),
        priceId: String(form.priceId || "").trim() || undefined,
        images: uploadedUrls,
        sizes,
        inventory,
        inStock,
      };

      if (!payload.id || !payload.name || !payload.price) {
        throw new Error("Please fill ID, Name and Price.");
      }

      const res = await fetch(`${API}/api/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": password,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create product");

      toast({ title: "Created", description: `${data.name}` });

      // reset form
      setForm({
        id: "",
        name: "",
        description: "",
        price: 0,
        priceId: "",
        images: [],
        sizes: [],
        inventory: {},
        inStock: true,
      });
setSizesInput("S,M,L,XL");
setInventoryMap({ S: 0, M: 0, L: 0, XL: 0 });
setUploadedUrls([]);

      await load();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || String(err),
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  }

 async function removeProduct(id: string) {
  if (!confirm(`Delete ${id}?`)) return;
  setDeletingId(id);
  try {
    const res = await fetch(`${API}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": password },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Delete failed");
    await load();
    toast({ title: "Deleted", description: id });
  } catch (e: any) {
    toast({
      title: "Delete failed",
      description: e.message || String(e),
      variant: "destructive",
    });
  } finally {
    setDeletingId(null);
  }
}


  function openForm() {
    setShowAdd(true);
    window.history.replaceState(null, "", "#add");
    setTimeout(() => {
      document
        .getElementById("add-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }
  function closeForm() {
    setShowAdd(false);
    window.history.replaceState(null, "", "#");
  }

function startEditStock(p: Product) {
  const sizes = (p.sizes && p.sizes.length)
    ? p.sizes
    : Object.keys(p.inventory || {});
  setEditingStockId(p.id);
  setEditSizes(sizes);
  setEditInv(
    sizes.reduce((acc, s) => {
      acc[s] = Number(p.inventory?.[s] ?? 0);
      return acc;
    }, {} as Record<string, number>)
  );
}

function cancelEditStock() {
  setEditingStockId(null);
  setEditSizes([]);
  setEditInv({});
}

async function saveEditStock() {
  if (!editingStockId) return;
  try {
const res = await fetch(
  `${API}/api/admin/products/${encodeURIComponent(editingStockId)}/inventory`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "x-admin-key": password,
    },
    body: JSON.stringify({ inventory: editInv }),
  }
);

// be defensive: the server might return HTML on error
const raw = await res.text();
let data: any = {};
try { data = raw ? JSON.parse(raw) : {}; } catch {
  // If it wasn't JSON, surface a helpful error
  throw new Error(
    `HTTP ${res.status} ${res.statusText}. Non-JSON response: ${raw.slice(0,120)}`
  );
}

if (!res.ok) {
  throw new Error(data?.error || `HTTP ${res.status} ${res.statusText}`);
}

toast({ title: "Stock updated" });
cancelEditStock();
await load();

  } catch (e: any) {
    toast({
      title: "Update failed",
      description: e.message || String(e),
      variant: "destructive",
    });
  }
}

  // ---------- RENDER ----------
  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="h-16 md:h-24" />
        <main className="flex-1 flex items-center justify-center">
          <form
            onSubmit={handleLogin}
            className="bg-card border rounded-4 p-6 w-full max-w-sm space-y-4"
          >
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-sm text-muted-foreground">Enter your admin key</p>

            <Label htmlFor="key">Admin key</Label>
            <Input
              id="key"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin key"
              required
            />

            <Button type="submit" className="w-full">
              Unlock
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Tip: set <code>VITE_ADMIN_KEY</code> in <code>.env.local</code>.
            </p>
          </form>
        </main>
      </div>
    );
  }

  return (
  <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="h-12 md:h-16" />
<main className="flex-1 container px-4 pb-10 relative z-10 pt-20">

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
  <div>
    <h1 className="text-3xl font-bold">Product Management</h1>
    <p className="text-muted-foreground">Manage your Soulfly inventory</p>
  </div>

  {/* Orders toolbar */}
  <div className="flex gap-2">
    <Button
      variant="outline"
      onClick={() => {
        const url = `${API}/admin/orders?key=${encodeURIComponent(password)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }}
    >
      View Orders
    </Button>

    {/* Optional: CSV export in a new tab */}
    <Button
      variant="secondary"
      onClick={() => {
        const url = `${API}/api/admin/orders.csv?key=${encodeURIComponent(password)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }}
    >
      Download CSV
    </Button>
  </div>
</div>


        {!showAdd && (
          <section className="grid place-items-center min-h-[30vh] mb-8">
            <Button onClick={openForm} className="px-6 py-6 rounded-2xl text-base">
              <Plus className="mr-2 h-5 w-5" />
              Add Product
            </Button>
          </section>
        )}

        {showAdd && (
          <>
            <form
              id="add-form"
              onSubmit={createProduct}
              className="scroll-mt-28 bg-card border rounded-4 p-6 mb-6 space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id">ID (slug)</Label>
                  <Input
                    id="id"
                    placeholder="444-essential-tee"
                    value={form.id || ""}
                    onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="444 Essential Tee"
                    value={form.name || ""}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="45"
                    value={form.price ?? 0}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: Number(e.target.value) }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="priceId">Stripe Price ID (optional)</Label>
                  <Input
                    id="priceId"
                    placeholder="price_..."
                    value={form.priceId || ""}
                    onChange={(e) => setForm((f) => ({ ...f, priceId: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank to auto-create Product & Price on Stripe (TEST).
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Images */}
                <div>
                  <Label>Images</Label>
                  <div
                    className="mt-3 border border-dashed rounded-4 p-6 text-sm text-muted-foreground"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files || []);
                      if (!files.length) return;
                      try {
                        setUploading(true);
                        const urls: string[] = [];
                        for (const f of files) {
                          const url = await uploadImage(f);
                          urls.push(url);
                        }
                        setUploadedUrls((prev) =>
                          Array.from(new Set([...prev, ...urls])),
                        );
                        toast({
                          title: "Uploaded",
                          description: `${urls.length} file(s) uploaded`,
                        });
                      } catch (err: any) {
                        toast({
                          title: "Upload failed",
                          description: err.message || String(err),
                          variant: "destructive",
                        });
                      } finally {
                        setUploading(false);
                      }
                    }}
                  >
                    Drag & drop images here or{" "}
                    <label className="underline cursor-pointer">
                      choose files
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          try {
                            setUploading(true);
                            const urls: string[] = [];
                            for (const f of files) {
                              const url = await uploadImage(f);
                              urls.push(url);
                            }
                            setUploadedUrls((prev) =>
                              Array.from(new Set([...prev, ...urls])),
                            );
                            toast({
                              title: "Uploaded",
                              description: `${urls.length} file(s) uploaded`,
                            });
                          } catch (err: any) {
                            toast({
                              title: "Upload failed",
                              description: err.message || String(err),
                              variant: "destructive",
                            });
                          } finally {
                            setUploading(false);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </label>
                    {uploading && <span className="ml-2">Uploading…</span>}
                  </div>

                  {uploadedUrls.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {uploadedUrls.map((u, i) => (
                        <div key={`${u}-${i}`} className="relative">
                          <img
                            src={resolveImg(u)}
                            alt=""
                            className="h-16 w-16 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageAt(i)}
                            className="absolute -top-2 -right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1"
                            title="Remove"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports .jpg, .jpeg, .png, .webp. Served from <code>/images/…</code>.
                  </p>
                </div>

                {/* Sizes + Inventory */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="sizes">Sizes (comma-separated)</Label>
                    <Input
  id="sizes"
  placeholder="S,M,L,XL"
  value={sizesInput}
  onChange={(e) => {
    const v = e.target.value;
    setSizesInput(v);
    syncInventoryWithSizes(v); // ← keep inventoryMap keys in sync with sizes
  }}
/>

                  </div>

            <div>
  <Label>Inventory</Label>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
    {(form.sizes || []).map((s) => (
      <div key={s} className="flex items-center gap-2">
        <span className="w-8 text-sm">{s}</span>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={inventoryMap[s] ?? 0}
          onChange={(e) =>
            setInventoryMap((m) => ({
              ...m,
              [s]: Math.max(0, parseInt(e.target.value || "0", 10)),
            }))
          }
        />
      </div>
    ))}
  </div>
  <p className="text-xs text-muted-foreground mt-1">
    We’ll send this as JSON automatically (e.g. {"{ S:10, M:5 }"}).
  </p>
</div>


                  <div className="flex items-center gap-2">
                    <input
                      id="inStock"
                      type="checkbox"
                      checked={form.inStock ?? true}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, inStock: e.target.checked }))
                      }
                    />
                    <Label htmlFor="inStock">In stock</Label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={creating || uploading}>
                  {creating ? "Creating…" : uploading ? "Uploading…" : "Create Product"}
                </Button>
              </div>
            </form>

            <div className="grid place-items-center mb-10">
              <Button
                onClick={closeForm}
                variant="outline"
                className="px-6 py-6 rounded-2xl text-base"
              >
                Close
              </Button>
            </div>
          </>
        )}

        {/* Table */}
        <div className="bg-card border rounded-4 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Stock</th>
                <th className="text-left p-3">Stripe priceId</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
          {items.map((p) => {
  const stockSummary =
    p.inventory && Object.keys(p.inventory).length
      ? Object.entries(p.inventory).map(([s, q]) => `${s}:${q}`).join(" ")
      : "—";

  const isEditing = editingStockId === p.id;

  return (
    <tr key={p.id} className="border-b align-top">
      {/* Product */}
      <td className="p-3">
        <div className="font-medium">{p.name}</div>
      </td>

      {/* Price */}
      <td className="p-3">${p.price}</td>

      {/* ID */}
      <td className="p-3">{p.id}</td>

      {/* Stock (inline editor or summary) */}
      <td className="p-3">
        {!isEditing ? (
          <>
            <div className="text-sm">{stockSummary}</div>
            <Button
              size="sm"
              variant="ghost"
              className="px-2 mt-1"
              onClick={() => startEditStock(p)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Edit stock
            </Button>
          </>
        ) : (
          <div className="mt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {editSizes.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-8 text-sm">{s}</span>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={editInv[s] ?? 0}
                    onChange={(e) =>
                      setEditInv((m) => ({
                        ...m,
                        [s]: Math.max(0, parseInt(e.target.value || "0", 10)),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={saveEditStock}>Save</Button>
              <Button size="sm" variant="outline" onClick={cancelEditStock}>Cancel</Button>
            </div>
          </div>
        )}
      </td>

      {/* Stripe priceId */}
      <td className="p-3">{p.priceId || "—"}</td>

      {/* Actions */}
      <td className="p-3 text-right">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => removeProduct(p.id)}
          disabled={deletingId === p.id}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {deletingId === p.id ? "Deleting…" : "Delete"}
        </Button>
      </td>
    </tr>
  );
})}

              {items.length === 0 && !loading && (
                <tr>
                  <td className="p-4 text-sm text-neutral-500" colSpan={6}>
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
