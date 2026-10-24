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
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Store Settings & Operations</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business policies, operational delivery timings, and contact metadata
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
            <input
              type="text"
              required
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
            <input
              type="text"
              required
              value={settings.tagline}
              onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Customer Care Helpline</label>
            <input
              type="text"
              required
              value={settings.support_phone}
              onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
            <input
              type="email"
              required
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Base Delivery Fee (₹)</label>
            <input
              type="number"
              required
              value={settings.default_delivery_fee}
              onChange={(e) => setSettings({ ...settings, default_delivery_fee: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Free Delivery Threshold (₹)</label>
            <input
              type="number"
              required
              value={settings.free_delivery_threshold}
              onChange={(e) => setSettings({ ...settings, free_delivery_threshold: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-bold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Operational Hours</label>
            <input
              type="text"
              required
              value={settings.operational_hours}
              onChange={(e) => setSettings({ ...settings, operational_hours: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Harbor Processing Address</label>
            <input
              type="text"
              required
              value={settings.support_address}
              onChange={(e) => setSettings({ ...settings, support_address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>

          <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Accept Online Catch Orders</span>
              <span className="text-[11px] text-slate-500">Toggle emergency store intake off during cyclonic weather or seasonal bans</span>
            </div>
            <input
              type="checkbox"
              checked={settings.is_accepting_orders}
              onChange={(e) => setSettings({ ...settings, is_accepting_orders: e.target.checked })}
              className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
}
