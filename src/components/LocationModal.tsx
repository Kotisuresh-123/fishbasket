'use client';

import React, { useState } from 'react';
import { useLocation } from '@/context/LocationContext';
import { MapPin, X, Check, AlertCircle, Search } from 'lucide-react';

export default function LocationModal() {
  const {
    isLocationModalOpen,
    closeLocationModal,
    selectedPincode,
    setPincode,
    availableZones,
    isServiceable,
  } = useLocation();

  const [inputPin, setInputPin] = useState(selectedPincode);
  const [filterQuery, setFilterQuery] = useState('');

  if (!isLocationModalOpen) return null;

  const handleApply = (pin: string) => {
    setPincode(pin);
    closeLocationModal();
  };

  const filteredZones = availableZones.filter(
    (z) =>
      z.area_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      z.pincode.includes(filterQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <MapPin className="w-5 h-5 text-teal-600" />
            <span>Select Delivery Location</span>
          </div>
          <button
            onClick={closeLocationModal}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN input */}
        <div className="p-5 border-b border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Enter 6-Digit Visakhapatnam PIN Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 530003"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
            />
            <button
              onClick={() => handleApply(inputPin)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Verify & Select
            </button>
          </div>

          {!isServiceable && (
            <div className="mt-3 flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>We currently deliver only within Visakhapatnam coastal zones (530001 - 530048). Please choose a serviceable area below.</span>
            </div>
          )}
        </div>

        {/* Quick select zones list */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Popular Serviceable Areas
            </h4>
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search area..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid gap-2">
            {filteredZones.map((zone) => {
              const isSelected = selectedPincode === zone.pincode;
              return (
                <button
                  key={zone.pincode}
                  onClick={() => handleApply(zone.pincode)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm text-slate-900 group-hover:text-teal-700">
                      {zone.area_name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      PIN: <span className="font-medium text-slate-700">{zone.pincode}</span> • Delivery within {zone.estimated_delivery_hours} hrs
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Deliver here →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
