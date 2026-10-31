'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Address } from '@/types';
import { DEMO_PROFILES, DEMO_ADDRESSES } from '@/data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoaded: boolean;
  addresses: Address[];
  defaultAddress: Address | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  register: (data: { email: string; full_name: string; phone: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  registerFisherman: (data: { email: string; display_name: string; full_name?: string; phone?: string; dock_location?: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  registerDeliveryPartner: (data: { email: string; full_name: string; phone?: string; vehicle_info?: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  refreshProfile: (targetUserId?: string) => Promise<UserProfile | null>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  addAddress: (addr: Omit<Address, 'id' | 'user_id' | 'created_at'>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'fishbasket_auth_v2';
const ADDRESS_STORAGE_KEY = 'fishbasket_addresses_v2';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>(DEMO_ADDRESSES);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        setUser(parsed);
        // Authoritative server-side sync for current session
        fetch('/api/auth/me')
          .then((r) => r.json())
          .then((d) => {
            if (d.success && d.user) {
              setUser(d.user);
              try {
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(d.user));
              } catch {}
            } else {
              setUser(null);
              localStorage.removeItem(AUTH_STORAGE_KEY);
            }
          })
          .catch(() => {});
      } else {
        setUser(null);
      }
      const savedAddresses = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // Ignore
    }
  }, [user, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
    } catch {
      // Ignore
    }
  }, [addresses, isLoaded]);

  // Real password-based login calling the secure backend endpoint
  const login = async (
    email: string,
    password: string = 'FishBasket@2026'
  ): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true, message: data.message, role: data.user.role };
      } else {
        return { success: false, message: data.message || 'Login failed.' };
      }
    } catch {
      // Offline fallback to DEMO_PROFILES matching email
      const matched = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());
      if (matched) {
        setUser(matched);
        return { success: true, role: matched.role };
      }
      return { success: false, message: 'Authentication network error. Please try again.' };
    }
  };

  // Customer registration
  const register = async (data: {
    email: string;
    full_name: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUser(resData.user);
        return { success: true, message: resData.message };
      } else {
        return { success: false, message: resData.message || 'Registration failed.' };
      }
    } catch {
      return { success: false, message: 'Network error during registration.' };
    }
  };

  // Fisherman registration
  const registerFisherman = async (data: {
    email: string;
    display_name: string;
    full_name?: string;
    phone?: string;
    dock_location?: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/register-fisherman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUser(resData.user);
        return { success: true, message: resData.message };
      } else {
        return { success: false, message: resData.message || 'Fisherman registration failed.' };
      }
    } catch {
      return { success: false, message: 'Network error during fisherman registration.' };
    }
  };

  // Delivery partner registration
  const registerDeliveryPartner = async (data: {
    email: string;
    full_name: string;
    phone?: string;
    vehicle_info?: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/register-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUser(resData.user);
        return { success: true, message: resData.message };
      } else {
        return { success: false, message: resData.message || 'Delivery partner registration failed.' };
      }
    } catch {
      return { success: false, message: 'Network error during delivery partner registration.' };
    }
  };

  const refreshProfile = async (_targetUserId?: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        } catch {}
        return data.user;
      } else {
        setUser(null);
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch {}
      }
    } catch {
      // Ignore
    }
    return null;
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  };

  // Arbitrary unauthenticated role switching is disabled per security specifications
  const switchDemoRole = (_role: UserRole) => {
    console.warn('Direct role switching without authentication is disabled.');
  };

  const addAddress = (addr: Omit<Address, 'id' | 'user_id' | 'created_at'>) => {
    const newAddr: Address = {
      ...addr,
      id: 'addr_' + Date.now(),
      user_id: user?.id || 'u1',
      created_at: new Date().toISOString(),
    };
    setAddresses((prev) => {
      let updated = [...prev];
      if (newAddr.is_default) {
        updated = updated.map((a) => ({ ...a, is_default: false }));
      }
      return [newAddr, ...updated];
    });
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        is_default: a.id === id,
      }))
    );
  };

  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAuthenticated: !!user,
        isLoaded,
        addresses,
        defaultAddress,
        login,
        register,
        registerFisherman,
        registerDeliveryPartner,
        refreshProfile,
        logout,
        switchDemoRole,
        addAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
