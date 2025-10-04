import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

export const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Generate discount code (in production, this would come from backend)
      const code = `SOULFLY10-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      toast({
        title: "Welcome to Soulfly! 🙏",
        description: `Your 10% off code: ${code}. Check your email for details.`,
      });

      setEmail("");
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="pattern-444 py-16 border-y">
      <div className="container px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join the <span className="text-gold">444</span> Family
          </h2>
          <p className="text-muted-foreground mb-8">
            Subscribe and get 10% off your first order
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading} className="btn-444">
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </div>
    </section>
  );
};
