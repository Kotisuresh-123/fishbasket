'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-[#00D2C4] bg-[#00D2C4]/10 px-3 py-1 rounded-full border border-[#00D2C4]/20 inline-block mb-2">
          Customer Care
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">
          We&apos;re Here to Help
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
          Have questions about your seafood order, custom cuts, or delivery timing? Reach out to our dedicated support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Direct Helpline</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">7 days a week, 06:00 AM - 09:00 PM</p>
              <a
                href="tel:+918919023456"
                className="inline-block mt-2 font-bold text-sm text-[#00D2C4] hover:underline"
              >
                +91 89190 23456
              </a>
            </div>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Email Inquiries</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Average response within 1 hour</p>
              <a
                href="mailto:care@fishbasket.in"
                className="inline-block mt-2 font-bold text-sm text-[#00D2C4] hover:underline"
              >
                care@fishbasket.in
              </a>
            </div>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-xs flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00D2C4]/15 text-[#00D2C4] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Coastal Processing Facility</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                Harbor Terminal 3, Coastal Road, Near Fishing Harbor, Visakhapatnam, Andhra Pradesh 530001
              </p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Message Received!</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Thank you for reaching out. Our customer care team will review your message and reply via phone or email shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--border)] font-semibold text-xs rounded-xl border border-[var(--border)] transition-colors cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-2">Send us a Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 00000"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@example.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Message or Query</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist you with your seafood order?"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 btn-aqua font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
