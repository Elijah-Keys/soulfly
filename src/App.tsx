import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ✅ shadcn toaster (keep this import if the file exists in your repo)
import { Toaster as ShadToaster } from "@/components/ui/toaster";

// ✅ safer Sonner import (package), works even if you don't have a local wrapper
import { Toaster as Sonner } from "sonner";

// ---------- Lazy pages (prevents one bad page from blanking the app) ----------
const Index         = lazy(() => import("./pages/Index"));
const Shop          = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart          = lazy(() => import("./pages/Cart"));
const About         = lazy(() => import("./pages/About"));
const Contact       = lazy(() => import("./pages/Contact"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Admin         = lazy(() => import("./pages/Admin"));
const Shipping      = lazy(() => import("./pages/policies/Shipping"));
const Returns       = lazy(() => import("./pages/policies/Returns"));
const Terms         = lazy(() => import("./pages/policies/Terms"));
const Privacy       = lazy(() => import("./pages/policies/Privacy"));
const ThankYou      = lazy(() => import("./pages/ThankYou")); // ✅ included
const Sell          = lazy(() => import("./pages/Sell"));      // ✅ included
const NotFound      = lazy(() => import("./pages/NotFound"));

// ---------- Small error boundary so crashes show a message instead of a blank page ----------
class DevErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("Boundary caught:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "crimson" }}>
          <h2>🚨 A route crashed</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Global toasts */}
      <ShadToaster />
      <Sonner richColors />

      {/* If you have "@/components/ui/tooltip", you can wrap with it later.
         For now we skip it to avoid import issues. */}

      <BrowserRouter>
        <DevErrorBoundary>
          <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/tracking" element={<OrderTracking />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/policies/shipping" element={<Shipping />} />
              <Route path="/policies/returns" element={<Returns />} />
              <Route path="/policies/terms" element={<Terms />} />
              <Route path="/policies/privacy" element={<Privacy />} />
              <Route path="/thank-you" element={<ThankYou />} /> {/* ✅ */}
              <Route path="/sell" element={<Sell />} />           {/* ✅ */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </DevErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
