import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useCart } from "@/lib/cart-store";
import { products } from "@/lib/products";

export const Header = () => {
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useNavigate();
  const location = useLocation();

  const scrollToShop = () => {
    const el = document.getElementById("shop");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // If URL hash is #shop (e.g., /#shop), auto-scroll
  useEffect(() => {
    if (location.hash === "#shop") {
      requestAnimationFrame(scrollToShop);
    }
  }, [location]);

  // ---- SEARCH STATE ----
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  // open with "/" key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return products
      .filter((p) => {
        const name = p.name?.toLowerCase() || "";
        const desc = p.description?.toLowerCase() || "";
        return name.includes(query) || desc.includes(query);
      })
      .slice(0, 12);
  }, [q]);

  const NavLinks = () => (
    <nav className="flex items-center gap-6 text-[11px] tracking-[0.22em] uppercase">
      <Link
        to="/#shop"
        onClick={(e) => {
          if (location.pathname === "/") {
            e.preventDefault();
            scrollToShop();
          }
        }}
        className="text-neutral-700 transition-colors hover:text-[#00C853]"
      >
        Shop
      </Link>
      <Link
        to="/about"
        className="text-neutral-700 transition-colors hover:text-[#00C853]"
      >
        About
      </Link>
      <Link
        to="/contact"
        className="text-neutral-700 transition-colors hover:text-[#00C853]"
      >
        Contact
      </Link>
      <Link
        to="/tracking"
        className="text-neutral-700 transition-colors hover:text-[#00C853]"
      >
        Order Tracking
      </Link>
    </nav>
  );

  return (
    // absolute so content below does NOT move
    <header className="absolute top-8 left-0 right-0 z-50">
      {/* 32px side gutters via mx-8 */}
      <div className="mx-8">
        <div className="mx-auto max-w-6xl">
          {/* minimal bar: no outline, no shadow */}
          <div className="grid grid-cols-3 items-center h-20 bg-[#E8E9DA] px-4 sm:px-6 rounded-2xl">
            {/* Mobile menu */}
            <div className="flex items-center md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-none hover:bg-transparent hover:text-neutral-900"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 bg-[#E8E9DF] border-none">
                  <div className="mt-10">
                    <div className="flex flex-col gap-6 text-xs tracking-[0.22em] uppercase">
                      <Link
                        to="/#shop"
                        onClick={(e) => {
                          if (location.pathname === "/") {
                            e.preventDefault();
                            scrollToShop();
                          }
                        }}
                        className="text-neutral-900 hover:text-[#00C853] transition-colors"
                      >
                        Shop
                      </Link>
                      <Link
                        to="/about"
                        className="text-neutral-900 hover:text-[#00C853] transition-colors"
                      >
                        About
                      </Link>
                      <Link
                        to="/contact"
                        className="text-neutral-900 hover:text-[#00C853] transition-colors"
                      >
                        Contact
                      </Link>
                      <Link
                        to="/tracking"
                        className="text-neutral-900 hover:text-[#00C853] transition-colors"
                      >
                        Order Tracking
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Left desktop nav */}
            <div className="hidden md:flex">
              <NavLinks />
            </div>

            {/* Center logo */}
            <div className="flex justify-center">
              <Link to="/" className="inline-flex items-baseline">
                <span className="font-allura text-3xl md:text-4xl leading-none tracking-tight">
                  Soulfly
                </span>
                <span className="font-dancing text-[#00C853] text-lg ml-1 leading-none align-super">
                  444
                </span>
              </Link>
            </div>

            {/* Right actions */}
            <div className="flex justify-end items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-none hover:bg-transparent hover:text-neutral-900"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                title="Search (/)"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Link to="/cart" className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none hover:bg-transparent hover:text-neutral-900"
                >
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold text-gold-foreground text-[10px] flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH SHEET (top) */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        {/* We don't need a trigger here; we control it with state */}
        <SheetContent
          side="top"
          className="border-none bg-[#E8E9DA] pt-6 pb-6 max-h-[80vh] overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-2xl">
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-neutral-600">
                Search products 
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 rounded hover:bg-[#00C853]/10"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input */}
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type a product name…"
              className="w-full bg-transparent border-b border-neutral-300 focus:border-[#00C853] outline-none pb-3 text-lg"
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) {
                  setSearchOpen(false);
                  navigate(`/product/${results[0].id}`);
                }
              }}
            />

            {/* Results */}
            <div className="mt-4 divide-y divide-neutral-200">
              {q.trim() && results.length === 0 && (
                <div className="py-6 text-neutral-500">No results found.</div>
              )}

              {results.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-4 py-3 px-1 rounded-md hover:bg-[#00C853]/10 transition-colors"
                >
                  <img
                    src={p.images?.[0]}
                    alt={p.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-neutral-600">
                      ${p.price.toFixed(2)} USD
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};
