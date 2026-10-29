import React from 'react';
import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-[var(--surface)] p-6 sm:p-10 rounded-3xl border border-[var(--border)] shadow-xs space-y-6 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          Cold-Chain Shipping & Delivery Policy
        </h1>

        <p>
          At <strong>Fish Basket</strong>, delivering perishable seafood in pristine, temperature-controlled conditions is our utmost operational priority. This policy outlines our packaging standards, delivery slots, and serviceable areas.
        </p>

        <h2 className="text-base font-bold text-[var(--text-primary)] pt-2">1. Cold-Chain Packaging Standards</h2>
        <p>
          All raw seafood is cleaned, processed, and packed in sealed food-grade containers accompanied by chilled, sub-zero gel cooling packs. The internal temperature inside the package is maintained between 0°C and 4°C throughout transit.
        </p>

        <h2 className="text-base font-bold text-[var(--text-primary)] pt-2">2. Serviceable Delivery Zones</h2>
        <p>
          Fish Basket currently delivers across coastal Visakhapatnam pin codes including 530001, 530002, 530003, 530016, 530017, 530026, 530044, 530045, and 530048. We do not dispatch orders to non-serviceable pin codes to prevent perishable spoilage.
        </p>

        <h2 className="text-base font-bold text-[var(--text-primary)] pt-2">3. Delivery Slots & Timings</h2>
        <p>
          Customers can choose from 4 daily delivery slots:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-[var(--text-primary)]">Early Morning:</strong> 06:30 AM – 09:30 AM</li>
          <li><strong className="text-[var(--text-primary)]">Mid-Morning:</strong> 10:00 AM – 01:00 PM</li>
          <li><strong className="text-[var(--text-primary)]">Evening Fresh:</strong> 04:30 PM – 07:30 PM</li>
          <li><strong className="text-[var(--text-primary)]">Dinner Special:</strong> 07:30 PM – 09:30 PM</li>
        </ul>

        <h2 className="text-base font-bold text-[var(--text-primary)] pt-2">4. Delivery Charges & Free Delivery Threshold</h2>
        <p>
          Orders with a seafood subtotal of <strong className="text-[var(--text-primary)]">₹499 or higher</strong> qualify for <strong className="text-[#00D2C4]">FREE Cold-Chain Delivery</strong>. For orders below ₹499, a nominal delivery charge of ₹49 applies to cover thermal packaging and dedicated courier handling.
        </p>

        <h2 className="text-base font-bold text-[var(--text-primary)] pt-2">5. Delivery Reception & Storage</h2>
        <p>
          Because raw seafood is highly perishable, please ensure someone is available at the delivery address to receive and immediately refrigerate the package upon arrival.
        </p>
      </div>
    </div>
  );
}
