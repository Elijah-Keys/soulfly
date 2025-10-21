import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8E9DF] text-black">
      <Header />
      <main className="flex-1 container px-4 pb-12 pt-32 md:pt-[72px]">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1>Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: January 2024</p>

          <h2>Agreement to Terms</h2>
          <p>By accessing and using Soulfly's website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

          <h2>Use License</h2>
          <p>Permission is granted to temporarily download one copy of materials on Soulfly's website for personal, non-commercial transitory viewing only.</p>

          <h2>Product Information</h2>
          <p>We strive to provide accurate product descriptions, pricing, and availability. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.</p>

          <h2>Pricing and Payment</h2>
          <p>All prices are in USD unless otherwise stated. We reserve the right to change prices at any time. Payment must be received before items are shipped.</p>

          <h2>Account Terms</h2>
          <ul>
            <li>You must be 18 years or older to use this service</li>
            <li>You must provide accurate and complete information</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You are responsible for all activities under your account</li>
          </ul>

          <h2>Prohibited Uses</h2>
          <p>You may not use our website:</p>
          <ul>
            <li>For any unlawful purpose</li>
            <li>To solicit others to perform unlawful acts</li>
            <li>To violate any international, federal, provincial, or state regulations</li>
            <li>To infringe upon or violate our intellectual property rights</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>All content on this website, including text, graphics, logos, images, and software, is the property of Soulfly and is protected by copyright and trademark laws.</p>

          <h2>Limitation of Liability</h2>
          <p>Soulfly shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>

          <h2>Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.</p>

          <h2>Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:444soulfly.co@gmail.com">444soulfly.co@gmail.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
