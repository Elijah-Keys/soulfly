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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pattern-444">
        <div className="container px-4 py-12 relative z-10">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-muted-foreground mb-12">
              Have questions? We'd love to hear from you.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <a
                href="mailto:444soulfly.co@gmail.com"
                className="flex items-center gap-3 p-6 border rounded-4 hover:border-gold transition-colors"
              >
                <Mail className="h-6 w-6 text-gold" />
                <div>
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground">444soulfly.co@gmail.com</p>
                </div>
              </a>

              <a
                href="https://instagram.com/444soulfly"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-6 border rounded-4 hover:border-gold transition-colors"
              >
                <Instagram className="h-6 w-6 text-gold" />
                <div>
                  <h3 className="font-semibold mb-1">Instagram</h3>
                  <p className="text-sm text-muted-foreground">@444soulfly</p>
                </div>
              </a>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more..."
                  rows={6}
                  required
                />
              </div>

              <Button type="submit" size="lg" className="w-full btn-444" disabled={loading}>
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
