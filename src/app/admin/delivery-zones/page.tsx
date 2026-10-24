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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Delivery Zones & Fees</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure serviceable coastal Visakhapatnam PIN codes, transit charges, and free delivery thresholds
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New PIN Code</span>
        </button>
      </div>

      {isAddOpen && (
        <form onSubmit={handleAddZone} className="bg-white p-6 rounded-2xl border border-teal-200 shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Add Serviceable Delivery Area</h3>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-400 text-sm">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">PIN Code (6 digits)</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 530018"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Area / Locality Name</label>
              <input
                type="text"
                required
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                placeholder="e.g. Waltair Uplands"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Delivery Charge (₹)</label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Delivery Min Order (₹)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
            >
              Add Zone
            </button>
          </div>
        </form>
      )}

      {/* Zones Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="p-4">PIN Code</th>
                <th className="p-4">Area & Neighborhood</th>
                <th className="p-4">City</th>
                <th className="p-4">Base Fee</th>
                <th className="p-4">Free Delivery Above</th>
                <th className="p-4 text-right">Serviceability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {zones.map((z) => (
                <tr key={z.pincode} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{z.pincode}</td>
                  <td className="p-4 font-semibold text-slate-800">{z.area_name}</td>
                  <td className="p-4 text-slate-600">{z.city}</td>
                  <td className="p-4 font-bold text-slate-800">{formatINR(z.delivery_charge)}</td>
                  <td className="p-4 text-slate-700">{formatINR(z.min_order_for_free_delivery)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleZone(z.pincode)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        z.is_serviceable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
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
