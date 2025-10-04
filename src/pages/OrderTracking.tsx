import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Track order logic here
    console.log('Tracking order:', orderNumber, email);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pattern-444">
        <div className="container px-4 py-12 relative z-10">
          <div className="max-w-xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Track Your Order</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Enter your order details to check the status
            </p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-card border rounded-4 p-8">
              <div>
                <Label htmlFor="order">Order Number</Label>
                <Input
                  id="order"
                  placeholder="e.g. #SOUL-12345"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full btn-444">
                Track Order
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                You'll receive tracking information via email once your order ships
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;
