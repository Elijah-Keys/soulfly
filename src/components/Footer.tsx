import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

const paymentMethods = [
  "Visa", "Mastercard", "AmEx", "Discover", 
  "Apple Pay", "Google Pay", "Shop Pay", "PayPal"
];

export const Footer = () => {
  return (
    <footer className="border-t bg-card mt-20">
      <div className="container px-4 py-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-xl font-black mb-4">
              SOULFLY<span className="text-gold">444</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4 italic">
              Never 2 fly 2 PRAY
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com/444soulfly" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="mailto:444soulfly.co@gmail.com"
                className="text-muted-foreground hover:text-gold transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="text-muted-foreground hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tracking" className="text-muted-foreground hover:text-foreground transition-colors">Order Tracking</Link></li>
              <li><Link to="/policies/shipping" className="text-muted-foreground hover:text-foreground transition-colors">Shipping</Link></li>
              <li><Link to="/policies/returns" className="text-muted-foreground hover:text-foreground transition-colors">Returns</Link></li>
              <li><Link to="/policies/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
              <li><Link to="/policies/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm text-muted-foreground mb-4">
              444soulfly.co@gmail.com
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              @444soulfly
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t pt-8 mb-8">
          <h4 className="text-sm font-semibold mb-4">We Accept</h4>
          <div className="flex flex-wrap gap-3">
            {paymentMethods.map((method) => (
              <div 
                key={method}
                className="px-3 py-1.5 border rounded text-xs font-medium text-muted-foreground"
              >
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 Soulfly. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <select className="bg-transparent border rounded px-2 py-1 text-xs">
              <option>United States (USD $)</option>
              <option>Canada (CAD $)</option>
              <option>United Kingdom (GBP £)</option>
              <option>Europe (EUR €)</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};
