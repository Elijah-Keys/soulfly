import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Shipping = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8E9DA]">
      <Header />
      <main className="flex-1 container px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert pt-20">
          <h1>Shipping Policy</h1>
          
          <h2>Processing Time</h2>
          <p>All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.</p>
          
          <h2>Shipping Rates & Delivery Estimates</h2>
          <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
          <ul>
            <li><strong>Standard Shipping (5-7 business days):</strong> $8.95</li>
            <li><strong>Express Shipping (2-3 business days):</strong> $15.95</li>
            <li><strong>Free Shipping:</strong> On all orders over $100</li>
          </ul>

          <h2>Shipment Confirmation & Order Tracking</h2>
          <p>You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.</p>

          <h2>International Shipping</h2>
          <p>We currently ship to the United States, Canada, and select European countries. International shipping times vary by location. Customs and import taxes may apply and are the responsibility of the customer.</p>

          <h2>Questions?</h2>
          <p>For any shipping-related questions, please contact us at <a href="mailto:444soulfly.co@gmail.com">444soulfly.co@gmail.com</a></p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shipping;
