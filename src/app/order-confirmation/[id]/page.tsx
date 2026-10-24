import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import OrderConfirmationClient from './OrderConfirmationClient';
import { formatINR } from '@/lib/cartUtils';
import {
  CheckCircle2,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
} from 'lucide-react';

interface OrderConfirmationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { id } = await params;
  const order = await dbService.getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Client Confetti & Header */}
      <OrderConfirmationClient orderNumber={order.order_number} />

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8 mt-6">
        {/* Next Steps Banner */}
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-teal-950">
                Scheduled Delivery: {order.delivery_slot.name}
              </h3>
              <p className="text-xs text-teal-700">
                Our kitchen will hygienically prepare and pack your seafood with sub-zero ice packs.
              </p>
            </div>
          </div>

          <Link
            href={`/track-order/${order.id}`}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
          >
            <span>Track Order Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Delivery Address
            </span>
            <div className="font-bold text-slate-900 text-sm">{order.delivery_address.recipient_name}</div>
            <div className="text-slate-600">{order.delivery_address.house_flat}, {order.delivery_address.street_locality}</div>
            {order.delivery_address.landmark && (
              <div className="text-slate-500">Landmark: {order.delivery_address.landmark}</div>
            )}
            <div className="text-slate-700 font-semibold">{order.delivery_address.city} - {order.delivery_address.pincode}</div>
            <div className="text-slate-500 pt-1">Phone: {order.delivery_address.phone}</div>
          </div>

          <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
              Payment & Status
            </span>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold text-slate-800 uppercase">
                {order.payment_method === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-bold text-emerald-700 uppercase">
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Order Status:</span>
              <span className="font-bold text-teal-700 uppercase">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Order Placed At:</span>
              <span className="text-slate-700 font-medium">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Receipt Table */}
        <div>
          <h3 className="font-bold text-sm text-slate-900 mb-3">Itemized Catch Summary</h3>
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900">{item.product_name}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.variant_name} • {item.preparation_name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatINR(item.unit_price + item.cleaning_fee)} × {item.quantity}
                  </div>
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {formatINR(item.item_total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Total Breakdown */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs max-w-xs ml-auto text-slate-600">
          <div className="flex justify-between">
            <span>Item Subtotal:</span>
            <span className="font-semibold text-slate-900">{formatINR(order.subtotal)}</span>
          </div>
          {order.cleaning_fee_total > 0 && (
            <div className="flex justify-between">
              <span>Cleaning & Preparation:</span>
              <span className="font-semibold text-slate-900">{formatINR(order.cleaning_fee_total)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Cold-Chain Delivery:</span>
            <span className="font-semibold">
              {order.delivery_fee === 0 ? 'FREE' : formatINR(order.delivery_fee)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-teal-700 font-bold">
              <span>Discount ({order.coupon_code}):</span>
              <span>-{formatINR(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Paid Total:</span>
            <span className="text-teal-800 text-base">{formatINR(order.total_amount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/shop"
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            ← Continue Shopping
          </Link>

          <Link
            href={`/track-order/${order.id}`}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <span>Live Order Tracking</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
