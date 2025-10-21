import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import { Trash2, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/lib/cart-store";

// add below imports
import { API, resolveImg } from "@/lib/api";


const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToShop = () => {
    const el = document.getElementById("shop");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const {
    items,
    removeItem,
    updateQuantity,
    discountCode,
    applyDiscount,
    removeDiscount,
    getSubtotal,
    getTotal,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();
const [checkingOut, setCheckingOut] = useState(false);
const [shipName, setShipName] = useState("");
const [shipLine1, setShipLine1] = useState("");
const [shipLine2, setShipLine2] = useState("");
const [shipCity, setShipCity] = useState("");
const [shipState, setShipState] = useState("");
const [shipZip, setShipZip] = useState("");
const [shipCountry, setShipCountry] = useState("US");
const [promo, setPromo] = useState<{ promoId: string; code: string } | null>(null);
// Address must be complete before starting checkout
const addressComplete = useMemo(
  () => [shipName, shipLine1, shipCity, shipState, shipZip, shipCountry].every(Boolean),
  [shipName, shipLine1, shipCity, shipState, shipZip, shipCountry]
);

// Cart.tsx – add this state + effect near other state hooks
const [stockByLine, setStockByLine] = useState<Record<string, number>>({});

useEffect(() => {
  let cancelled = false;
  (async () => {
    // fetch live stock for each cart line’s productId + size
    const pairs = await Promise.all(
      items.map(async (i) => {
        try {
          const r = await fetch(`${API}/api/products/${i.productId}`);
          if (!r.ok) throw new Error("fetch failed");
          const p = await r.json();
          const available = Number(p?.inventory?.[i.size] ?? Infinity);
          return [i.id, available] as const; // key by cart line id
        } catch {
          return [i.id, Infinity] as const;   // fail-open (UI), server still enforces
        }
      })
    );
    if (!cancelled) setStockByLine(Object.fromEntries(pairs));
  })();
  return () => { cancelled = true; };
}, [items]);
// Map each cart line id -> max available for its chosen size
const [lineMax, setLineMax] = useState<Record<string, number>>({});

// Helper to (re)load stock for current cart
async function refreshStock() {
  // small dedupe so we don’t fetch the same product multiple times
  const uniqueKey = (i: any) => `${i.productId}|${i.size}`;
  const seen = new Set<string>();

  const pairs = await Promise.all(
    items.map(async (i) => {
      const key = uniqueKey(i);
      if (seen.has(key)) {
        // find the first matching line we already fetched
        const found = items.find(j => uniqueKey(j) === key);
        return [i.id, lineMax[found?.id ?? ""] ?? Infinity] as const;
      }
      seen.add(key);

      try {
        if (!i.productId) return [i.id, Infinity] as const; // fail-open; server still enforces at checkout
        const r = await fetch(`${API}/api/products/${i.productId}`);
        if (!r.ok) throw new Error("fetch failed");
        const p = await r.json();
        const available = Number(p?.inventory?.[i.size] ?? 0);
        return [i.id, Number.isFinite(available) ? available : 0] as const;
      } catch {
        return [i.id, Infinity] as const; // network hiccup → don’t block UI; server clamps later
      }
    })
  );

  setLineMax(Object.fromEntries(pairs));
}

useEffect(() => {
  refreshStock();
  // refresh whenever cart composition changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [items]);


useEffect(() => {
  if ((location.state as any)?.scrollTop) {
    // jump to the top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // clear the flag so back/forward doesn't retrigger
    navigate(location.pathname, { replace: true, state: {} });
  }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

async function startCheckout() {
  if (checkingOut) return;

  // Hard stop if address is incomplete
  if (!addressComplete) {
    toast({
      title: "Shipping address required",
      description: "Please fill out all shipping fields before checkout.",
      variant: "destructive",
    });
    return;
  }

  setCheckingOut(true);

  // Local preflight: if any line exceeds known stock, clamp & warn, skip calling server
  for (const it of items) {
    const max = lineMax[it.id];
    if (Number.isFinite(max) && it.quantity > max) {
      updateQuantity(it.id, Math.max(0, Number(max)));
      toast({
        title: "Updated to stock",
        description: `${it.name} (${it.size}) limited to ${max}.`,
      });
      setCheckingOut(false);
      return;
    }
  }

  try {
    // Validate items first
    const cleanItems = items.map((i) => {
      if (!i.priceId) throw new Error(`Missing priceId for ${i.name || i.productId}`);
      if (!i.productId) throw new Error(`Missing productId for ${i.name || "item"}`);
      return {
        id: String(i.productId),
        priceId: String(i.priceId),
        qty: Math.max(1, Number(i.quantity) || 1),
        size: String(i.size || ""),
      };
    });

    // We already require addressComplete, so shipTo will always be sent
    const payload: any = {
      items: cleanItems,
      shipTo: {
        name: shipName,
        line1: shipLine1,
        line2: shipLine2,
        city: shipCity,
        state: shipState,
        postal_code: shipZip,
        country: shipCountry || "US",
      },
    };

    const res = await fetch(`${API}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        promoId: promo?.promoId || null,
        promoCode: promo?.code || null,
      }),
    });

    const text = await res.text();
    let data: any = {};
    try { data = JSON.parse(text); } catch {}

    if (!res.ok) throw new Error(data?.error || `Checkout failed (${res.status})`);
    if (!data.url) throw new Error("No checkout URL returned");

    window.location.href = data.url;
  } catch (err: any) {
    toast({
      title: "Checkout failed",
      description: err.message || "Please try again.",
      variant: "destructive",
    });
    setCheckingOut(false);
  }
}







  const subtotal = getSubtotal();
  const total = getTotal();
  const discount = subtotal - total;

const handleApplyPromo = async () => {
  if (!promoCode.trim()) return;
  setApplying(true);
  try {
    const r = await fetch(`${API}/promo/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoCode.trim() })
    });
    const data = await r.json();

    if (!data.ok) {
      throw new Error(data.error || "Invalid or expired code");
    }

    // If your cart store still wants to track a local discount, you can keep this line:
    // applyDiscount(data.code || promoCode.toUpperCase(), /* temp display only */ 0);

    setPromo({ promoId: data.promoId, code: (promoCode || "").toUpperCase() });

    const label =
      data.coupon?.percent_off
        ? `${data.coupon.percent_off}% off`
        : data.coupon?.amount_off
        ? `$${(data.coupon.amount_off / 100).toFixed(2)} off`
        : "Discount";

    toast({ title: "Promo applied", description: `${label} with ${promoCode.toUpperCase()}` });
    setPromoCode("");
  } catch (e: any) {
    toast({ title: "Invalid promo code", description: e.message || "Try another code.", variant: "destructive" });
  } finally {
    setApplying(false);
  }
};


  // EMPTY STATE
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#E8E9DF]">
        <Header />
        <main className="flex-1 bg-[#E8E9DF]">
          {/* plenty of whitespace + centered CTA */}
          <div className="mx-auto max-w-2xl px-4 min-h-[80vh] grid place-items-center">
            <div className="text-center space-y-6 md:space-y-8">
              <h1 className="text-3xl font-bold">Your cart is empty</h1>
              <p className="text-muted-foreground">Add some items to get started</p>

              <Button
                size="lg"
                onClick={() => {
                  if (location.pathname === "/") {
                    scrollToShop();
                  } else {
                    navigate("/#shop");
                  }
                }}
                className="rounded-none bg-[#00C853] text-white border border-transparent hover:bg-white hover:text-black transition-colors"
              >
                Shop Now
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // NON-EMPTY STATE
  return (
    <div className="min-h-screen flex flex-col bg-[#E8E9DF]">
      <Header />

     <main className="flex-1 bg-[#E8E9DF] pt-5 md:pt-0">
        {/* extra desktop whitespace */}
        <div className="container px-4 md:px-8 lg:px-12 py-12 md:py-20 lg:py-24 relative z-10">
    <h1 className="text-4xl font-bold mt-12 mb-8 md:mb-12">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
            {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 bg-[#E8E9DF] p-4 md:p-6 rounded-4">
              {items.map((item) => (
     <div key={item.id} className="border rounded-4 p-4 flex gap-4 bg-transparent">
                  <img
   src={resolveImg(item.image) || "/placeholder.png"}
   alt={item.name}
   className="w-24 h-24 object-cover rounded-4"
 />

                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Size: {item.size}</p>
                    <p className="font-semibold">${item.price}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
  variant="ghost"
  size="icon"
  className="text-neutral-700 hover:text-[#00C853] hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
  onClick={() => removeItem(item.id)}
>
  <Trash2 className="h-4 w-4" />
</Button>


                    <div className="flex items-center gap-2 border rounded-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-neutral-700 hover:text-[#00C853] hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-8 text-center font-medium">{item.quantity}</span>

                      {(() => {
                        const maxQty = lineMax[item.id]; // from your refreshStock() state
                        const atMax = Number.isFinite(maxQty) && item.quantity >= maxQty;
                        return (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={atMax}
                            className="text-neutral-700 hover:text-[#00C853] hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
                            onClick={() => {
                              if (Number.isFinite(maxQty)) {
                                const next = Math.min(item.quantity + 1, maxQty as number);
                                if (next === item.quantity) {
                                  const msg =
                                    (maxQty as number) === 0
                                      ? `Sold out in ${item.size}`
                                      : `Only ${maxQty} left in ${item.size}`;
                                  toast({ title: "Stock limit reached", description: msg });
                                  return;
                                }
                                updateQuantity(item.id, next);
                              } else {
                                // unknown stock (fail-open); server clamps at checkout
                                updateQuantity(item.id, item.quantity + 1);
                              }
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div>
           <div className="bg-[#E8E9DF] border rounded-4 p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-[#00C853]">
                      <span>Discount ({discountCode})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {subtotal >= 100 ? "FREE" : "Calculated at checkout"}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
{/* Shipping Address (used to quote the exact shipping before Checkout) */}
<div className="mb-6 space-y-2">
  <h3 className="font-semibold">Shipping Address</h3>
  <Input placeholder="Full name" value={shipName} onChange={e => setShipName(e.target.value)} />
  <Input placeholder="Address line 1" value={shipLine1} onChange={e => setShipLine1(e.target.value)} />
  <Input placeholder="Address line 2 (optional)" value={shipLine2} onChange={e => setShipLine2(e.target.value)} />
  <div className="grid grid-cols-2 gap-2">
    <Input placeholder="City" value={shipCity} onChange={e => setShipCity(e.target.value)} />
    <Input placeholder="State" value={shipState} onChange={e => setShipState(e.target.value)} />
  </div>
  <div className="grid grid-cols-2 gap-2">
    <Input placeholder="ZIP / Postal code" value={shipZip} onChange={e => setShipZip(e.target.value)} />
    <Input placeholder="Country (US)" value={shipCountry} onChange={e => setShipCountry(e.target.value)} />
  </div>
  <p className="text-xs text-neutral-500">
    We use this to calculate exact shipping in Checkout. Make sure it matches the address you’ll use on the next page.
  </p>
</div>

              {/* Promo Code */}
<div className="mb-6">
  {discountCode ? (
    <div className="flex items-center justify-between p-3 bg-[#00C853]/10 border border-[#00C853] rounded-4">
      <span className="text-sm font-medium">{discountCode} applied</span>
      <Button
        variant="ghost"
        size="sm"
        className="focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2 focus-visible:outline-none"
        onClick={() => {
          removeDiscount();
          setPromo(null);
        }}
      >
        Remove
      </Button>
    </div>
  ) : (
    <div className="flex gap-2">
      <Input
        placeholder="Promo code"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
        className="focus:border-[#00C853] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
      />
      <Button
        variant="outline"
        onClick={handleApplyPromo}
        disabled={applying || !promoCode}
        className="border-transparent text-neutral-900 hover:bg-[#00C853] hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
      >
        Apply
      </Button>
    </div>
  )}
</div>

     <Button
  size="lg"
  onClick={startCheckout}
  disabled={checkingOut || !addressComplete}
  title={!addressComplete ? "Fill out the shipping form first" : undefined}
  className="w-full rounded-none bg-[#00C853] text-white border border-transparent hover:bg:white hover:text-black hover:border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2 mb-2"
>
  {checkingOut ? "Redirecting..." : "Proceed to Checkout"}
</Button>

{!addressComplete && (
  <p className="text-xs text-red-600 mb-4">
    Please complete the shipping address above to continue.
  </p>
)}


                <Button
  variant="outline"
  className="w-full border-transparent text-neutral-900 hover:bg-[#00C853] hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
  onClick={() => {
    if (location.pathname === "/") {
      scrollToShop();
    } else {
      navigate("/#shop");
    }
  }}
>
  Continue Shopping
</Button>

              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default Cart;
