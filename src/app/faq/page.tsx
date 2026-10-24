import React from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    {
      q: 'Where do you source your seafood from?',
      a: 'We source all freshwater fish directly from Godavari and Krishna river basins, and marine saltwater catches directly from coastal fishing cooperatives and mechanized trawlers in Visakhapatnam, Kakinada, and Pulicat Lake. Everything is brought in at dawn.',
    },
    {
      q: 'Do you use formalin or chemical preservatives?',
      a: 'Absolutely not. 100% of our seafood is certified chemical and formalin free. We chill the fish immediately upon landing using clean food-grade ice and maintain 0°C to 4°C throughout our cold-chain network.',
    },
    {
      q: 'What is the difference between Gross Weight and Net Cleaned Weight?',
      a: 'Gross Weight refers to the whole fish as harvested before cleaning. Net Cleaned Weight is what remains after descaling, degutting, cutting fins, or peeling prawn shells. For instance, a 1000g Rohu fish yields approximately 700g-750g of clean curry pieces. We display both weights transparently on every product.',
    },
    {
      q: 'Can I choose how my seafood is cut?',
      a: 'Yes! We offer customized artisanal cuts including Bengali/South Indian Curry Cut, Fry Cut (thin slices without head), Whole Cleaned with Slits, and Peeled & Deveined for prawns.',
    },
    {
      q: 'How is the seafood packaged for delivery?',
      a: 'Seafood is packed in sealed, food-grade biodegradable trays nestled inside insulated thermal courier boxes with frozen gel ice packs that keep the internal temperature below 4°C.',
    },
    {
      q: 'What are the delivery slots?',
      a: 'We operate 4 daily slots in Visakhapatnam: Early Morning (06:30 AM - 09:30 AM), Mid-Morning (10:00 AM - 01:00 PM), Evening Fresh (04:30 PM - 07:30 PM), and Dinner Special (07:30 PM - 09:30 PM).',
    },
    {
      q: 'What is your refund policy if the catch is damaged?',
      a: 'If you are unsatisfied with freshness or receive damaged items, notify our care team with a photo within 2 hours of delivery. We offer immediate replacement or a full refund.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Everything you need to know about our seafood sourcing, cutting yields, packaging, and deliveries.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-5 group open:shadow-xs transition-all cursor-pointer"
          >
            <summary className="font-bold text-sm text-slate-900 flex items-center justify-between list-none">
              <span>{faq.q}</span>
              <span className="text-teal-600 font-black text-lg group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-slate-100 pt-3">
              {faq.a}
            </p>
          </details>
        ))}
      </div>

      <div className="text-center pt-6 text-xs text-slate-500">
        Still have a question?{' '}
        <Link href="/contact" className="text-teal-700 font-bold underline">
          Contact our helpline
        </Link>
      </div>
    </div>
  );
}
