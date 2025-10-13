import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#E8E9DF]">
      <Header />

   <main className="flex-1 container px-4 pb-12 pt-[72px] bg-[#E8E9DF]">

        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: January 2024</p>

          <h2>Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Name, email address, and contact information</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely through our payment provider)</li>
            <li>Order history and preferences</li>
            <li>Communications with customer service</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Send order confirmations and shipping updates</li>
            <li>Respond to your questions and provide customer support</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our products and services</li>
            <li>Prevent fraud and ensure security</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We do not sell or rent your personal information to third parties. We may share your information with:</p>
          <ul>
            <li>Service providers who help us operate our business</li>
            <li>Shipping carriers to deliver your orders</li>
            <li>Payment processors to complete transactions</li>
            <li>Law enforcement when required by law</li>
          </ul>

          <h2>Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to improve your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.</p>

          <h2>Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and receive a copy of your personal data</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal data</li>
            <li>Opt-out of marketing communications</li>
            <li>Object to processing of your personal data</li>
          </ul>

          <h2>Children's Privacy</h2>
          <p>Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children.</p>

          <h2>Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:444soulfly.co@gmail.com">444soulfly.co@gmail.com</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;
