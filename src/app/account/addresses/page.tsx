'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Plus, Trash2, Check, Home, Briefcase } from 'lucide-react';

export default function SavedAddressesPage() {
  const { user, addresses, addAddress, deleteAddress, setDefaultAddress } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);

  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [streetLocality, setStreetLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('530003');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseFlat || !streetLocality) return;

    addAddress({
      label,
      recipient_name: recipientName || user?.full_name || 'Customer',
      phone: phone || user?.phone || '',
      house_flat: houseFlat,
      street_locality: streetLocality,
      landmark,
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      pincode: pincode.trim(),
      is_default: addresses.length === 0,
    });

    setHouseFlat('');
    setStreetLocality('');
    setLandmark('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Saved Addresses</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage your doorstep delivery destinations in Visakhapatnam
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[var(--text-primary)]">Add Delivery Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Address Label</label>
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLabel(l)}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold transition-all ${
                      label === l
                        ? 'border-[#00D2C4] bg-teal-500/10 text-teal-700 dark:text-[#00D2C4]'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Recipient Name</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4] transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4] transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">House / Flat / Building</label>
              <input
                type="text"
                required
                value={houseFlat}
                onChange={(e) => setHouseFlat(e.target.value)}
                placeholder="Door No, Flat, Apartment name"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4] transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Street, Area & Locality</label>
              <input
                type="text"
                required
                value={streetLocality}
                onChange={(e) => setStreetLocality(e.target.value)}
                placeholder="e.g. Beach Road, Pandurangapuram"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4] transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="Near Submarine Museum"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4] transition-colors"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">PIN Code (Visakhapatnam)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:border-[#00D2C4] focus:ring-1 focus:ring-[#00D2C4] font-bold transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 btn-aqua rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Save Address
            </button>
          </div>
        </form>
      )}

      {/* Addresses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`bg-[var(--surface)] p-5 rounded-2xl border transition-all space-y-3 relative ${
              addr.is_default
                ? 'border-[#00D2C4] shadow-xs ring-2 ring-teal-500/20'
                : 'border-[var(--border)]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200/50 dark:bg-slate-800/60 text-[var(--text-primary)]">
                {addr.label === 'Home' ? <Home className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                {addr.label}
              </span>

              {addr.is_default ? (
                <span className="text-[10px] font-bold text-teal-600 dark:text-[#00D2C4] flex items-center gap-1">
                  <Check className="w-3 h-3" /> Default Delivery
                </span>
              ) : (
                <button
                  onClick={() => setDefaultAddress(addr.id)}
                  className="text-[11px] text-teal-600 dark:text-[#00D2C4] hover:underline font-semibold"
                >
                  Set as Default
                </button>
              )}
            </div>

            <div className="text-xs space-y-1">
              <div className="font-bold text-[var(--text-primary)]">{addr.recipient_name}</div>
              <div className="text-[var(--text-secondary)]">{addr.house_flat}, {addr.street_locality}</div>
              {addr.landmark && <div className="text-[var(--text-secondary)] opacity-80">Near: {addr.landmark}</div>}
              <div className="text-[var(--text-primary)] font-semibold">{addr.city} - {addr.pincode}</div>
              <div className="text-[var(--text-secondary)] pt-1">Phone: {addr.phone}</div>
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => deleteAddress(addr.id)}
                className="text-xs text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
