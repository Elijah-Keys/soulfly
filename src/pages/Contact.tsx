import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Instagram } from "lucide-react";

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 24 hours.",
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#E8E9DF]">
      <Header />

      {/* Remove pattern; add our 444 background row */}
      <main className="flex-1 relative overflow-hidden">
        {/* 444 motif — one even row across */}
        <div aria-hidden className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 sm:px-8 flex items-center justify-between">
            <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
            <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
            <span className="font-dancing text-[#00C853] opacity-[0.1] text-[10rem] md:text-[16rem] leading-none">444</span>
          </div>
        </div>

        {/* Foreground content */}
<div className="container px-4 py-12 pt-32 md:pt-0 relative z-10">

          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
           

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <a
                href="mailto:444soulfly.co@gmail.com"
                className="flex items-center gap-3 p-6 border rounded-4 hover:border-[#00C853] transition-colors"
              >
                <Mail className="h-6 w-6 text-[#00C853]" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground">444soulfly.co@gmail.com</p>
                </div>
              </a>

              <a
                href="https://instagram.com/444soulfly"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-6 border rounded-4 hover:border-[#00C853] transition-colors"
              >
                <Instagram className="h-6 w-6 text-[#00C853]" />
                <div>
                  <h3 className="font-semibold mb-1">Instagram</h3>
                  <p className="text-sm text-muted-foreground">@444soulfly</p>
                </div>
              </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" required />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" required />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Tell us more..." rows={6} required />
              </div>

              <Button
  type="submit"
  size="lg"
  disabled={loading}
  className="w-full bg-[#00C853] text-white border border-transparent hover:bg-white hover:text-black transition-colors focus-visible:ring-2 focus-visible:ring-[#00C853] focus-visible:ring-offset-2"
>
  {loading ? "Sending..." : "Send Message"}
</Button>

            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
