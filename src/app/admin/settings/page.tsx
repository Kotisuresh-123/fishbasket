'use client';

import React, { useState } from 'react';
import { STORE_SETTINGS } from '@/data/mockData';
import { StoreSettings } from '@/types';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(STORE_SETTINGS);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border)] shadow-xs max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Store Settings & Operations</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Configure business policies, operational delivery timings, and contact metadata
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Store Name</label>
            <input
              type="text"
              required
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Brand Tagline</label>
            <input
              type="text"
              required
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Customer Care Helpline</label>
            <input
              type="text"
              required
              value={settings.support_phone}
              onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Support Email</label>
            <input
              type="email"
              required
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Base Delivery Fee (₹)</label>
            <input
              type="number"
              required
              value={settings.default_delivery_fee}
              onChange={(e) => setSettings({ ...settings, default_delivery_fee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Free Delivery Threshold (₹)</label>
            <input
              type="number"
              required
              value={settings.free_delivery_threshold}
              onChange={(e) => setSettings({ ...settings, free_delivery_threshold: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Operational Hours</label>
            <input
              type="text"
              required
              value={settings.operational_hours}
              onChange={(e) => setSettings({ ...settings, operational_hours: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-[var(--text-secondary)] mb-1">Harbor Processing Address</label>
            <input
              type="text"
              required
              value={settings.support_address}
              onChange={(e) => setSettings({ ...settings, support_address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
            />
          </div>

          <div className="sm:col-span-2 p-3.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--text-primary)] block">Accept Online Catch Orders</span>
              <span className="text-[11px] text-[var(--text-secondary)]">Toggle emergency store intake off during cyclonic weather or seasonal bans</span>
            </div>
            <input
              type="checkbox"
              checked={settings.is_accepting_orders}
              onChange={(e) => setSettings({ ...settings, is_accepting_orders: e.target.checked })}
              className="w-5 h-5 accent-[#00D2C4] rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 btn-aqua font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
}
