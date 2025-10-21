import { useState } from "react";

export default function Sell() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const body = {
        name,
        description,
        price: Number(price),
        imageUrls,
        sizes: sizes.split(",").map(s => s.trim()).filter(Boolean),
        inventory: {}, // you can add inputs per size later
      };
      const res = await fetch("http://localhost:3001/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // if you set ADMIN_TOKEN in .env on server, put it here:
          Authorization: "Bearer supersecret123",
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "failed");
      setMsg(`✅ Listed! slug: ${data.slug}, priceId: ${data.priceId}`);
      setName(""); setPrice(""); setDescription(""); setImageUrls([]); setSizes("");
    } catch (err: any) {
      setMsg(`❌ ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Listing</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="w-full border p-2" placeholder="Title" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border p-2" placeholder="Price (e.g. 45)" value={price} onChange={e=>setPrice(e.target.value)} />
        <textarea className="w-full border p-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <input className="w-full border p-2" placeholder="Image URL 1" onChange={e=>setImageUrls([e.target.value])} />
        <input className="w-full border p-2" placeholder="Sizes (comma separated: S,M,L,XL)" value={sizes} onChange={e=>setSizes(e.target.value)} />
        <button disabled={loading} className="px-4 py-2 bg-black text-white">{loading ? "Publishing..." : "Publish"}</button>
      </form>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
      <p className="mt-6 text-sm text-gray-500">Tip: paste any image URL now; later we can add uploads (Cloudinary/Supabase).</p>
    </main>
  );
}
