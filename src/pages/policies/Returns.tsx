import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Returns = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Returns & Exchanges</h1>
          
          <h2>Our 30-Day Return Policy</h2>
          <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days of delivery for a full refund or exchange.</p>
          
          <h2>Return Requirements</h2>
          <p>To be eligible for a return, items must:</p>
          <ul>
            <li>Be unworn, unwashed, and in original condition</li>
            <li>Have all original tags attached</li>
            <li>Be in original packaging</li>
            <li>Include proof of purchase</li>
          </ul>

          <h2>How to Return</h2>
          <ol>
            <li>Contact us at <a href="mailto:444soulfly.co@gmail.com">444soulfly.co@gmail.com</a> to initiate your return</li>
            <li>We'll provide you with a return shipping label</li>
            <li>Pack your item(s) securely in the original packaging</li>
            <li>Affix the return label and drop off at any carrier location</li>
          </ol>

          <h2>Refunds</h2>
          <p>Once we receive your return, we'll inspect it and process your refund within 5-7 business days. Refunds will be issued to your original payment method.</p>

          <h2>Exchanges</h2>
          <p>If you need a different size or color, we're happy to exchange your item. Please follow the return process and note in your email that you'd like an exchange.</p>

          <h2>Final Sale Items</h2>
          <p>Items marked as "Final Sale" or purchased during special drops cannot be returned or exchanged.</p>

          <h2>Questions?</h2>
          <p>Contact us at <a href="mailto:444soulfly.co@gmail.com">444soulfly.co@gmail.com</a> and we'll be happy to help.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Returns;
