import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import { Trash2, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const subtotal = getSubtotal();
  const total = getTotal();
  const discount = subtotal - total;

  const handleApplyPromo = () => {
    setApplying(true);

    setTimeout(() => {
      if (promoCode.toUpperCase().startsWith("SOULFLY10")) {
        const discountAmount = subtotal * 0.1;
        applyDiscount(promoCode.toUpperCase(), discountAmount);
        toast({
          title: "Promo code applied!",
          description: `You saved $${discountAmount.toFixed(2)}`,
        });
      } else {
        toast({
          title: "Invalid promo code",
          description: "Please check your code and try again.",
          variant: "destructive",
        });
      }
      setApplying(false);
      setPromoCode("");
    }, 500);
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

      <main className="flex-1 bg-[#E8E9DF]">
        {/* extra desktop whitespace */}
        <div className="container px-4 md:px-8 lg:px-12 py-12 md:py-20 lg:py-24 relative z-10">
    <h1 className="text-4xl font-bold mt-12 mb-8 md:mb-12">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 xl:gap-16">
            {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 bg-[#E8E9DF] p-4 md:p-6 rounded-4">
              {items.map((item) => (
     <div key={item.id} className="border rounded-4 p-4 flex gap-4 bg-transparent">
                  <img
                    src={item.image}
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
  onClick={() => updateQuantity(item.id, item.quantity - 1)}
>
  <Minus className="h-4 w-4" />
</Button>

                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                     <Button
  variant="ghost"
  size="icon"
  className="text-neutral-700 hover:text-[#00C853] hover:bg-transparent focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
  onClick={() => updateQuantity(item.id, item.quantity + 1)}
>
  <Plus className="h-4 w-4" />
</Button>

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

              {/* Promo Code */}
<div className="mb-6">
  {discountCode ? (
    <div className="flex items-center justify-between p-3 bg-[#00C853]/10 border border-[#00C853] rounded-4">
      <span className="text-sm font-medium">{discountCode} applied</span>
      <Button
        variant="ghost"
        size="sm"
        className="focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2 focus-visible:outline-none"
        onClick={removeDiscount}
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
  className="w-full rounded-none bg-[#00C853] text-white border border-transparent hover:bg-white hover:text-black hover:border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2 mb-4"
>
  Proceed to Checkout
</Button>

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
