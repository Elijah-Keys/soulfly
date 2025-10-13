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

    setTimeout(() => {
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
    // remove pattern-444; make room for our custom 444 background
    <section className="relative py-16 border-y">
      {/* SAME 444 MOTIF AS HERO (background-only) */}
 {/* SAME 444 MOTIF — one even row across */}
<div aria-hidden className="absolute inset-0 pointer-events-none select-none">
  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 sm:px-8 flex items-center justify-between">
    <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
    <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
    <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
  </div>
</div>


      {/* Foreground content */}
      <div className="container px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join the <span className="font-dancing text-[#00C853]">444</span> Family
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
    className="flex-1 focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
  />
  <Button
    type="submit"
    disabled={loading}
    className="rounded-none bg-[#00C853] text-white px-6 py-2 border border-transparent
               hover:bg-white hover:text-black hover:border-transparent transition-colors
               focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
  >
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
