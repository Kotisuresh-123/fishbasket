import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 prose prose-slate text-xs sm:text-sm">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 not-prose mb-6">
        Terms and Conditions of Service
      </h1>

      <p>
        Welcome to <strong>Fish Basket</strong>. By browsing our website, placing an order, or using our doorstep seafood delivery services, you agree to comply with and be bound by the following terms and conditions.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">1. Fresh Seafood Nature & Availability</h2>
      <p>
        Marine and freshwater catches are subject to weather, seasonal fishing ban periods, and dawn netting availability. In the rare event a specific seafood species is unavailable after your order is confirmed, our team will promptly contact you for an alternative catch or full refund.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">2. Pricing & Net Weight Calculations</h2>
      <p>
        Seafood prices fluctuate with daily harbor auctions. Prices displayed at checkout are final. For weight-based items, gross catch weight and estimated net cleaned weight are modeled based on standard cutting yields.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">3. User Conduct & Account Security</h2>
      <p>
        Users are responsible for maintaining the confidentiality of their account credentials and delivery details. Fish Basket reserves the right to cancel orders placed with fraudulent intent.
      </p>

      <h2 className="text-base font-bold text-slate-900 not-prose mt-6 mb-2">4. Governing Law</h2>
      <p>
        These terms shall be governed by and construed in accordance with the laws of India, under the jurisdiction of courts in Visakhapatnam, Andhra Pradesh.
      </p>
    </div>
  );
}
