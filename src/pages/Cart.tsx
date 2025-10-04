import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart-store";
import { Trash2, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { items, removeItem, updateQuantity, discountCode, applyDiscount, removeDiscount, getSubtotal, getTotal } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);
  const { toast } = useToast();

  const subtotal = getSubtotal();
  const total = getTotal();
  const discount = subtotal - total;

  const handleApplyPromo = () => {
    setApplying(true);
    
    // Simulate promo code validation
    setTimeout(() => {
      if (promoCode.toUpperCase().startsWith('SOULFLY10')) {
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
      setPromoCode('');
    }, 500);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some items to get started</p>
            <Link to="/shop">
              <Button size="lg">Shop Now</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pattern-444">
        <div className="container px-4 py-12 relative z-10">
          <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-card border rounded-4 p-4 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-4"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Size: {item.size}
                    </p>
                    <p className="font-semibold">${item.price}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-2 border rounded-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
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
              <div className="bg-card border rounded-4 p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-gold">
                      <span>Discount ({discountCode})</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">
                      {subtotal >= 100 ? 'FREE' : 'Calculated at checkout'}
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
                    <div className="flex items-center justify-between p-3 bg-gold/10 border border-gold rounded-4">
                      <span className="text-sm font-medium">{discountCode} applied</span>
                      <Button
                        variant="ghost"
                        size="sm"
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
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={applying || !promoCode}
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                <Button size="lg" className="w-full btn-444 mb-4">
                  Proceed to Checkout
                </Button>

                <Link to="/shop">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
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
