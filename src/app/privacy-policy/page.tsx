import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 prose prose-slate text-xs sm:text-sm">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 not-prose mb-6">
        Privacy & Data Protection Policy
      </h1>

      <p>
        Fish Basket respects your privacy and is committed to protecting your personal information. This Privacy Policy details how we collect, use, and safeguard the data you provide when using our e-commerce platform.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">1. Information We Collect</h2>
      <p>
        We collect your name, contact phone number, email address, delivery addresses, and order history strictly to fulfill orders, facilitate deliveries, and communicate transactional status updates.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">2. Payment Security</h2>
      <p>
        Fish Basket does NOT store, capture, or have access to your credit/debit card numbers, CVVs, or banking credentials. All online transactions are handled securely through RBI-compliant payment gateways like Razorpay with 256-bit encryption.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">3. Third-Party Sharing</h2>
      <p>
        Your contact details and delivery location are shared only with our assigned delivery partners solely to ensure accurate, timely doorstep handover. We never sell, rent, or trade customer information to advertisers.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">4. Contacting Data Officer</h2>
      <p>
        For inquiries regarding data retention or to request account deletion, please contact care@fishbasket.in.
      </p>
    </div>
  );
}
