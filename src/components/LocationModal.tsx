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
      <div className="bg-white dark:bg-[#17232E] text-[#112233] dark:text-[#EAF2F8] w-full max-w-lg rounded-2xl shadow-2xl border border-[#DCE5EA] dark:border-[#243444] overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DCE5EA] dark:border-[#243444] bg-[#F8FAFA] dark:bg-[#121C25] transition-colors">
          <div className="flex items-center gap-2 font-bold text-lg">
            <MapPin className="w-5 h-5 text-[#00D2C4]" />
            <span>Select Delivery Location</span>
          </div>
          <button
            onClick={closeLocationModal}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-[#1F2E3D] text-[#7E92A2] dark:text-[#6B7F91] hover:text-[#112233] dark:hover:text-[#EAF2F8] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN input */}
        <div className="p-5 border-b border-[#DCE5EA] dark:border-[#243444]">
          <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] uppercase tracking-wider mb-2">
            Enter 6-Digit Visakhapatnam PIN Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 530003"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:ring-2 focus:ring-[#00D2C4] font-medium placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
            />
            <button
              onClick={() => handleApply(inputPin)}
              className="px-5 py-2.5 btn-aqua rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Verify & Select
            </button>
          </div>

          {!isServiceable && (
            <div className="mt-3 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-medium bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>We currently deliver only within Visakhapatnam coastal zones (530001 - 530048). Please choose a serviceable area below.</span>
            </div>
          )}
        </div>

        {/* Quick select zones list */}
        <div className="p-5 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[#7E92A2] dark:text-[#6B7F91] uppercase tracking-wider">
              Popular Serviceable Areas
            </h4>
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#7E92A2] dark:text-[#6B7F91]" />
              <input
                type="text"
                placeholder="Search area..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] placeholder:text-[#7E92A2] dark:placeholder:text-[#6B7F91]"
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
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'border-[#00D2C4] bg-[#00D2C4]/15 shadow-xs'
                      : 'border-[#DCE5EA] dark:border-[#243444] bg-[#F8FAFA] dark:bg-[#121C25] hover:border-[#00D2C4]/40 hover:bg-[#00D2C4]/5'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm text-[#112233] dark:text-[#EAF2F8] group-hover:text-[#00D2C4] transition-colors">
                      {zone.area_name}
                    </div>
                    <div className="text-xs text-[#52667A] dark:text-[#9DB0C0] mt-0.5">
                      PIN: <span className="font-medium text-[#112233] dark:text-[#EAF2F8]">{zone.pincode}</span> • Delivery within {zone.estimated_delivery_hours} hrs
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#00D2C4] text-[#112233] flex items-center justify-center flex-shrink-0 font-bold">
                      <Check className="w-3.5 h-3.5 text-[#112233]" />
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-[#00D2C4] opacity-0 group-hover:opacity-100 transition-opacity">
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
