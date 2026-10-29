'use client';

import React, { useState } from 'react';
import { DeliveryZone } from '@/types';
import { INITIAL_DELIVERY_ZONES } from '@/data/mockData';
import { formatINR } from '@/lib/cartUtils';
import { MapPin, Plus, Check } from 'lucide-react';

export default function AdminDeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>(INITIAL_DELIVERY_ZONES);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [pincode, setPincode] = useState('');
  const [areaName, setAreaName] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState('49');
  const [minOrder, setMinOrder] = useState('499');

  const handleToggleZone = (pincode: string) => {
    setZones((prev) =>
      prev.map((z) => (z.pincode === pincode ? { ...z, is_serviceable: !z.is_serviceable } : z))
    );
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || !areaName.trim()) return;

    const newZ: DeliveryZone = {
      id: 'z_' + Date.now(),
      pincode: pincode.trim(),
      area_name: areaName.trim(),
      city: 'Visakhapatnam',
      delivery_charge: parseFloat(deliveryCharge) || 49,
      min_order_for_free_delivery: parseFloat(minOrder) || 499,
      is_serviceable: true,
      estimated_delivery_hours: 2,
    };

    setZones([...zones, newZ]);
    setIsAddOpen(false);
    setPincode('');
    setAreaName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Delivery Zones & Fees</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Configure serviceable coastal Visakhapatnam PIN codes, transit charges, and free delivery thresholds
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New PIN Code</span>
        </button>
      </div>

      {isAddOpen && (
        <form onSubmit={handleAddZone} className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Add Serviceable Delivery Area</h3>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm cursor-pointer">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">PIN Code (6 digits)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 530018"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Area / Locality Name</label>
              <input
                type="text"
                required
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Waltair Uplands"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Delivery Charge (₹)</label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-secondary)] mb-1">Free Delivery Min Order (₹)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 btn-aqua rounded-xl text-xs font-bold cursor-pointer"
            >
              Add Zone
            </button>
          </div>
        </form>
      )}

      {/* Zones Table */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[10px] border-b border-[var(--border)]">
              <tr>
                <th className="p-4">PIN Code</th>
                <th className="p-4">Area & Neighborhood</th>
                <th className="p-4">City</th>
                <th className="p-4">Base Fee</th>
                <th className="p-4">Free Delivery Above</th>
                <th className="p-4 text-right">Serviceability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {zones.map((z) => (
                <tr key={z.pincode} className="hover:bg-[var(--surface-elevated)] transition-colors">
                  <td className="p-4 font-mono font-bold text-[var(--text-primary)]">{z.pincode}</td>
                  <td className="p-4 font-semibold text-[var(--text-primary)]">{z.area_name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{z.city}</td>
                  <td className="p-4 font-bold text-[var(--text-primary)]">{formatINR(z.delivery_charge)}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{formatINR(z.min_order_for_free_delivery)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleZone(z.pincode)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                        z.is_serviceable ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
                      }`}
                    >
                      {z.is_serviceable ? 'Serviceable' : 'Suspended'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
