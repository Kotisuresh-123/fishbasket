import React from 'react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 prose prose-slate text-xs sm:text-sm">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 not-prose mb-6">
        Cancellation & Quality Refund Policy
      </h1>

      <p>
        At <strong>Fish Basket</strong>, we pride ourselves on providing the freshest, chemical-free seafood. If for any reason our catch fails to meet your expectations, our refund and return policy is designed to be prompt, fair, and transparent.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">1. 100% Freshness Guarantee</h2>
      <p>
        We guarantee that our seafood is fresh, clean, and completely free of artificial preservatives, formalin, or chemical treatments. If you receive seafood with an off-odor, damaged packaging, or discoloration, you are entitled to an immediate replacement or full refund.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">2. Reporting Window (Within 2 Hours)</h2>
      <p>
        Due to the perishable nature of fresh seafood, quality concerns must be reported within <strong>2 hours of receiving the delivery</strong>. Please share a photograph or short video of the seafood and packaging to our customer care helpline at <strong>+91 89190 23456</strong> or email <strong>care@fishbasket.in</strong>.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">3. Cancellation Policy</h2>
      <p>
        Orders may be cancelled free of charge before the seafood is accepted for preparation and custom cutting. Once the seafood has been descaled or cut by our butchery team, cancellations cannot be accepted as the custom cuts cannot be resold.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">4. Refund Processing</h2>
      <p>
        Approved refunds for online payments made through Razorpay will be credited to the original payment source (UPI, Credit/Debit card, or Netbanking) within 3 to 5 business days. Cash on Delivery refunds will be credited via instant UPI transfer.
      </p>
    </div>
  );
}
