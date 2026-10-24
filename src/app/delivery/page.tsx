'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import { supabase } from '@/lib/supabaseClient';
import {
  Truck,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Navigation,
  Radio,
  Package,
  Layers,
  Check,
  ShieldCheck,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function DeliveryPartnerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'completed'>('available');
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    try {
      // 1. Fetch available dispatches (unassigned ready_for_pickup orders)
      const availRes = await fetch('/api/orders?available=true');
      const availData = await availRes.json();
      if (availData.success) {
        setAvailableOrders(availData.orders || []);
      }

      // 2. Fetch deliveries assigned to current driver (or all if admin)
      const driverId = user?.id || 'u3';
      const myRes = await fetch(
        user?.role === 'admin'
          ? '/api/orders'
          : `/api/orders?deliveryPartnerId=${encodeURIComponent(driverId)}`
      );
      const myData = await myRes.json();
      if (myData.success) {
        setMyOrders(myData.orders || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch delivery orders:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id, user?.role]);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Supabase Realtime Subscription on orders table
  useEffect(() => {
    const channel = supabase
      .channel('delivery-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          // Live Realtime event arrived - reconcile queries
          fetchOrders(true);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // Accept / Claim an available delivery atomically
  const handleAcceptDelivery = async (orderId: string) => {
    setActionInProgressId(orderId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim',
          deliveryPartnerId: user?.id || 'u3',
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setFeedback({
          message: `Delivery ${data.order.order_number} accepted! Moved to My Active Deliveries.`,
          type: 'success',
        });
        // Switch tab to active so driver sees their accepted delivery immediately
        setActiveTab('active');
        fetchOrders(true);
      } else {
        setFeedback({
          message: data.message || 'Could not claim delivery. It may have been accepted by another driver.',
          type: 'error',
        });
        fetchOrders(true);
      }
    } catch {
      setFeedback({ message: 'Network error accepting delivery.', type: 'error' });
    } finally {
      setActionInProgressId(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Update delivery status (Out for Delivery or Delivered)
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    setActionInProgressId(orderId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          requesterId: user?.id || 'u3',
          requesterRole: user?.role || 'delivery_partner',
          notes: `Delivery updated to ${status} by ${user?.full_name || 'Fleet Partner'}`,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setFeedback({
          message: `Order status updated to ${status.replace(/_/g, ' ')}.`,
          type: 'success',
        });
        fetchOrders(true);
      } else {
        setFeedback({
          message: data.message || 'Failed to update delivery status.',
          type: 'error',
        });
      }
    } catch {
      setFeedback({ message: 'Network error updating delivery status.', type: 'error' });
    } finally {
      setActionInProgressId(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const myActiveDeliveries = myOrders.filter(
    (o) => o.status === 'out_for_delivery' || o.status === 'ready_for_pickup' || o.status === 'packed'
  );
  const myCompletedDeliveries = myOrders.filter((o) => o.status === 'delivered');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Delivery Partner Hub
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                realtimeConnected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  realtimeConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                }`}
              />
              <span>{realtimeConnected ? 'Live Supabase Realtime' : 'Connecting Realtime...'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cold-chain seafood dispatches across Visakhapatnam
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('available')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all shadow-xs ${
            activeTab === 'available'
              ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
            Available Dispatches
          </span>
          <div className="text-2xl font-black text-amber-600">{availableOrders.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Ready for pickup</span>
        </div>

        <div
          onClick={() => setActiveTab('active')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all shadow-xs ${
            activeTab === 'active'
              ? 'border-teal-400 bg-teal-50/30 ring-2 ring-teal-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 block mb-1">
            My Active Route
          </span>
          <div className="text-2xl font-black text-teal-700">{myActiveDeliveries.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Assigned to vehicle</span>
        </div>

        <div
          onClick={() => setActiveTab('completed')}
          className={`cursor-pointer p-5 rounded-2xl border transition-all shadow-xs ${
            activeTab === 'completed'
              ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
            Completed Today
          </span>
          <div className="text-2xl font-black text-emerald-600">{myCompletedDeliveries.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Delivered fresh</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Handled
          </span>
          <div className="text-2xl font-black text-slate-900">{myOrders.length}</div>
          <span className="text-xs text-slate-500 mt-1 block">Driver lifetime count</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'available'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Available Deliveries</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'available' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {availableOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>My Active Deliveries</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'active' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {myActiveDeliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed ({myCompletedDeliveries.length})</span>
        </button>
      </div>

      {/* Tab 1: Available Deliveries */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Dispatches Ready for Pickup ({availableOrders.length})
            </h2>
            <span className="text-xs text-slate-400">
              Orders appear automatically when fishermen mark Ready for Pickup
            </span>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-600 mx-auto mb-2" />
              <span>Scanning available deliveries in Visakhapatnam harbor...</span>
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Truck className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-800 text-sm">No Dispatches Waiting for Pickup</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All packed catches have been assigned or are currently being prepped. When a fisherman marks an order &ldquo;Ready for Pickup&rdquo;, it will instantly appear here via Realtime.
              </p>
            </div>
          ) : (
            availableOrders.map((order) => {
              const mapsQuery = encodeURIComponent(
                `${order.delivery_address.house_flat}, ${order.delivery_address.street_locality}, ${order.delivery_address.city} ${order.delivery_address.pincode}`
              );
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
              const isClaiming = actionInProgressId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 shadow-xs space-y-4 hover:border-amber-300 transition-all"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {order.order_number}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ready for Pickup
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      Total / COD: <strong className="text-amber-700 text-sm">{formatINR(order.total_amount)}</strong>{' '}
                      <span className="text-[11px] text-slate-500">({order.payment_method.toUpperCase()})</span>
                    </div>
                  </div>

                  {/* Pickup & Destination Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Pickup Details */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Pickup Location (Harbor Facility)
                      </span>
                      <div className="font-bold text-slate-900">{order.seller_name || 'Visakha Harbor Cooperative'}</div>
                      <div className="text-slate-600 text-[11px]">
                        Landing Jetty #3, Visakhapatnam Fishing Harbor
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Slot: <strong className="text-slate-700">{order.delivery_slot.name}</strong>
                      </div>
                    </div>

                    {/* Delivery Destination */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Delivery Destination & Recipient
                      </span>
                      <div className="font-bold text-slate-900">{order.customer_name}</div>
                      <div className="text-slate-600">
                        {order.delivery_address.house_flat}, {order.delivery_address.street_locality}
                      </div>
                      {order.delivery_address.landmark && (
                        <div className="text-slate-500 text-[11px]">Near: {order.delivery_address.landmark}</div>
                      )}
                      <div className="text-slate-800 font-semibold text-[11px]">
                        {order.delivery_address.city} - {order.delivery_address.pincode}
                      </div>
                      {order.delivery_notes && (
                        <div className="p-1.5 bg-amber-100/60 rounded text-amber-900 text-[11px] mt-1">
                          Notes: &ldquo;{order.delivery_notes}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Package Catches */}
                  <div className="p-3 bg-slate-50/80 rounded-xl text-xs space-y-1 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Catches in this Batch ({order.items.length})
                    </span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-slate-700 flex justify-between text-xs">
                        <span>
                          {item.quantity}× {item.product_name}
                          {item.preparation_name && (
                            <span className="text-slate-400 text-[11px]"> ({item.preparation_name})</span>
                          )}
                        </span>
                        <span className="font-semibold text-slate-900">{formatINR(item.item_total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Accept Delivery Action */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        <span>Preview Route ↗</span>
                      </a>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 text-xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span>Call Customer</span>
                      </a>
                    </div>

                    <button
                      disabled={isClaiming}
                      onClick={() => handleAcceptDelivery(order.id)}
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Truck className={`w-4 h-4 ${isClaiming ? 'animate-bounce' : ''}`} />
                      <span>{isClaiming ? 'Claiming Delivery...' : 'Accept This Delivery →'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: My Active Deliveries */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              My Active Route ({myActiveDeliveries.length})
            </h2>
            <span className="text-xs text-slate-400">
              Orders currently claimed by your delivery vehicle
            </span>
          </div>

          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
              <span>Loading assigned deliveries...</span>
            </div>
          ) : myActiveDeliveries.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="font-bold text-slate-800 text-sm">No Active Deliveries on Road</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                You have no active orders in your delivery queue. Switch to the &ldquo;Available Deliveries&rdquo; tab to accept ready catches.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl"
              >
                View Available Dispatches ({availableOrders.length})
              </button>
            </div>
          ) : (
            myActiveDeliveries.map((order) => {
              const mapsQuery = encodeURIComponent(
                `${order.delivery_address.house_flat}, ${order.delivery_address.street_locality}, ${order.delivery_address.city} ${order.delivery_address.pincode}`
              );
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
              const isUpdating = actionInProgressId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {order.order_number}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'out_for_delivery'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-800">
                      COD Collection: <strong className="text-slate-900">{formatINR(order.total_amount)}</strong>{' '}
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({order.payment_method.toUpperCase()} - {order.payment_status.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  {/* Customer Details & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Customer & Destination
                      </span>
                      <div className="font-bold text-slate-900 text-sm">{order.customer_name}</div>
                      <div className="text-slate-600">
                        {order.delivery_address.house_flat}, {order.delivery_address.street_locality}
                      </div>
                      {order.delivery_address.landmark && (
                        <div className="text-slate-400">Near: {order.delivery_address.landmark}</div>
                      )}
                      <div className="text-slate-800 font-semibold">
                        {order.delivery_address.city} - {order.delivery_address.pincode}
                      </div>
                      {order.delivery_notes && (
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-800 text-[11px] mt-1.5 font-medium">
                          Notes: &ldquo;{order.delivery_notes}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Delivery Slot & Navigation
                      </span>
                      <div className="text-slate-700 font-medium">{order.delivery_slot.name}</div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <a
                          href={`tel:${order.customer_phone}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-teal-600" />
                          <span>Call ({order.customer_phone})</span>
                        </a>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Open Maps ↗</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Package Summary */}
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Packed Catches ({order.items.length})
                    </span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-slate-700 flex justify-between text-xs">
                        <span>
                          {item.quantity}× {item.product_name}
                          {item.preparation_name && (
                            <span className="text-slate-400 text-[11px]"> ({item.preparation_name})</span>
                          )}
                        </span>
                        <span className="font-semibold">{formatINR(item.item_total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Status action buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/track-order/${order.id}`}
                      target="_blank"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                    >
                      Customer Tracking Page ↗
                    </Link>

                    <div className="flex items-center gap-2">
                      {(order.status === 'ready_for_pickup' || order.status === 'packed') && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Start Delivery (Out for Delivery) →</span>
                        </button>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <button
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Delivered (Handed Over) ✓</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Completed Deliveries */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Delivered Dispatches ({myCompletedDeliveries.length})
          </h2>

          {myCompletedDeliveries.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              No deliveries marked completed yet.
            </div>
          ) : (
            <div className="space-y-3">
              {myCompletedDeliveries.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        {order.order_number}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Delivered
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Recipient: <strong className="text-slate-800">{order.customer_name}</strong> •{' '}
                      {order.delivery_address.street_locality}, {order.delivery_address.city}
                    </div>
                  </div>

                  <div className="text-right sm:text-right">
                    <div className="font-bold text-slate-900 text-sm">
                      {formatINR(order.total_amount)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {order.payment_method.toUpperCase()} • {order.payment_status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
