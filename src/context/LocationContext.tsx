'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DELIVERY_ZONES } from '@/data/mockData';
import { DeliveryZone } from '@/types';

interface LocationContextType {
  selectedPincode: string;
  selectedZone: DeliveryZone | null;
  isServiceable: boolean;
  isLocationModalOpen: boolean;
  setPincode: (pincode: string) => void;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  availableZones: DeliveryZone[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);
const LOCATION_STORAGE_KEY = 'fishbasket_pincode_v1';

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedPincode, setSelectedPincode] = useState<string>('530003');
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(INITIAL_DELIVERY_ZONES[2]); // Beach Road / Siripuram
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedPin = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedPin) {
        setPincode(savedPin);
      }
    } catch {
      // Ignore
    }
  }, []);

  const setPincode = (pin: string) => {
    const cleanPin = pin.trim();
    setSelectedPincode(cleanPin);
    const matched = INITIAL_DELIVERY_ZONES.find((z) => z.pincode === cleanPin);

    if (matched && matched.is_serviceable) {
      setSelectedZone(matched);
      setIsServiceable(true);
    } else {
      setSelectedZone(null);
      setIsServiceable(false);
    }

    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, cleanPin);
    } catch {
      // Ignore
    }
  };

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        selectedPincode,
        selectedZone,
        isServiceable,
        isLocationModalOpen,
        setPincode,
        openLocationModal,
        closeLocationModal,
        availableZones: INITIAL_DELIVERY_ZONES,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
