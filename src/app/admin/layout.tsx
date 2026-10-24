'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  MapPin,
  Star,
  Settings,
  ShieldAlert,
  ArrowLeft,
  Truck,
  Anchor,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const adminNav = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders Pipeline', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products Catalog', href: '/admin/products', icon: Package },
    { name: 'Fisherman Management', href: '/admin/fishermen', icon: Anchor },
    { name: 'Delivery Fleet', href: '/admin/delivery-partners', icon: Truck },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Inventory & Batches', href: '/admin/inventory', icon: Boxes },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    { name: 'Delivery Zones & Fees', href: '/admin/delivery-zones', icon: MapPin },
    { name: 'Review Moderation', href: '/admin/reviews', icon: Star },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  // Role Gate: strictly require authenticated admin account
  if (role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Administrator Access Required</h2>
        <p className="text-xs text-slate-500">
          This operations backoffice is strictly reserved for authorized Fish Basket administrators. Please sign in with verified admin credentials.
        </p>
        <div className="pt-2 flex justify-center gap-2">
          <Link
            href="/login?redirect=/admin"
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            Sign In as Administrator
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70">
      {/* Top Admin Bar */}
      <div className="bg-slate-900 text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-white font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="font-black text-sm tracking-tight text-white flex items-center gap-2">
            <span>Fish Basket Operations Hub</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600/30 text-teal-300 border border-teal-500/30">
              Admin Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:block text-slate-300">
            Logged as: <strong className="text-white">{user?.full_name}</strong>
          </div>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Admin Sidebar Navigation */}
          <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Management Menu
            </div>
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </aside>

          {/* Admin Workspace Content */}
          <main className="lg:col-span-9">{children}</main>
        </div>
      </div>
    </div>
  );
}
