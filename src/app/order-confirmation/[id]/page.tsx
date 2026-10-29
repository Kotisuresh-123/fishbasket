import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import OrderConfirmationClient from './OrderConfirmationClient';
import { formatINR } from '@/lib/cartUtils';
import {
  ArrowRight,
  Truck,
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

      <div className="bg-white dark:bg-[#17232E] rounded-3xl border border-[#DCE5EA] dark:border-[#243444] p-6 sm:p-10 shadow-sm space-y-8 mt-6 transition-colors">
        {/* Next Steps Banner */}
        <div className="p-4 bg-[#00D2C4]/15 border border-[#00D2C4]/35 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00D2C4] text-[#112233] flex items-center justify-center flex-shrink-0 font-bold">
              <Truck className="w-5 h-5 text-[#112233]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8]">
                Scheduled Delivery: {order.delivery_slot.name}
              </h3>
              <p className="text-xs text-[#009E93] dark:text-[#00D2C4] font-medium">
                Our kitchen will hygienically prepare and pack your seafood with sub-zero ice packs.
              </p>
            </div>
          </div>

          <Link
            href={`/track-order/${order.id}`}
            className="px-5 py-2.5 btn-aqua font-bold text-xs rounded-xl whitespace-nowrap shadow-xs flex items-center gap-1.5"
          >
            <span>Track Order Status</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#112233]" />
          </Link>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1 bg-[#EDF3F5] dark:bg-[#121C25] p-4 rounded-2xl border border-[#DCE5EA] dark:border-[#243444]">
            <span className="font-bold text-[#7E92A2] dark:text-[#6B7F91] uppercase tracking-wider block text-[10px]">
              Delivery Address
            </span>
            <div className="font-bold text-[#112233] dark:text-[#EAF2F8] text-sm">{order.delivery_address.recipient_name}</div>
            <div className="text-[#52667A] dark:text-[#9DB0C0]">{order.delivery_address.house_flat}, {order.delivery_address.street_locality}</div>
            {order.delivery_address.landmark && (
              <div className="text-[#7E92A2] dark:text-[#6B7F91]">Landmark: {order.delivery_address.landmark}</div>
            )}
            <div className="text-[#112233] dark:text-[#EAF2F8] font-semibold">{order.delivery_address.city} - {order.delivery_address.pincode}</div>
            <div className="text-[#52667A] dark:text-[#9DB0C0] pt-1">Phone: {order.delivery_address.phone}</div>
          </div>

          <div className="space-y-1 bg-[#EDF3F5] dark:bg-[#121C25] p-4 rounded-2xl border border-[#DCE5EA] dark:border-[#243444]">
            <span className="font-bold text-[#7E92A2] dark:text-[#6B7F91] uppercase tracking-wider block text-[10px]">
              Payment & Status
            </span>
            <div className="flex justify-between py-0.5">
              <span className="text-[#52667A] dark:text-[#9DB0C0]">Payment Method:</span>
              <span className="font-bold text-[#112233] dark:text-[#EAF2F8] uppercase">
                {order.payment_method === 'razorpay' ? 'Razorpay Online' : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#52667A] dark:text-[#9DB0C0]">Payment Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                {order.payment_status}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#52667A] dark:text-[#9DB0C0]">Order Status:</span>
              <span className="font-bold text-[#009E93] dark:text-[#00D2C4] uppercase">
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#52667A] dark:text-[#9DB0C0]">Order Placed At:</span>
              <span className="text-[#112233] dark:text-[#EAF2F8] font-medium">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Receipt Table */}
        <div>
          <h3 className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] mb-3">Itemized Catch Summary</h3>
          <div className="border border-[#DCE5EA] dark:border-[#243444] rounded-2xl overflow-hidden divide-y divide-[#DCE5EA] dark:divide-[#243444] text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 bg-white dark:bg-[#17232E]">
                <div>
                  <div className="font-bold text-[#112233] dark:text-[#EAF2F8]">{item.product_name}</div>
                  <div className="text-[11px] text-[#52667A] dark:text-[#9DB0C0]">
                    {item.variant_name} • {item.preparation_name}
                  </div>
                  <div className="text-[11px] text-[#7E92A2] dark:text-[#6B7F91]">
                    {formatINR(item.unit_price + item.cleaning_fee)} × {item.quantity}
                  </div>
                </div>
                <div className="font-black text-[#112233] dark:text-[#EAF2F8] text-sm">
                  {formatINR(item.item_total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Total Breakdown */}
        <div className="border-t border-[#DCE5EA] dark:border-[#243444] pt-4 space-y-2 text-xs max-w-xs ml-auto text-[#52667A] dark:text-[#9DB0C0]">
          <div className="flex justify-between">
            <span>Item Subtotal:</span>
            <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{formatINR(order.subtotal)}</span>
          </div>
          {order.cleaning_fee_total > 0 && (
            <div className="flex justify-between">
              <span>Cleaning & Preparation:</span>
              <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{formatINR(order.cleaning_fee_total)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Cold-Chain Delivery:</span>
            <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">
              {order.delivery_fee === 0 ? 'FREE' : formatINR(order.delivery_fee)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Discount ({order.coupon_code}):</span>
              <span>-{formatINR(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-[#112233] dark:text-[#EAF2F8] pt-2 border-t border-[#DCE5EA] dark:border-[#243444]">
            <span>Paid Total:</span>
            <span className="text-[#009E93] dark:text-[#00D2C4] text-base">{formatINR(order.total_amount)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-[#DCE5EA] dark:border-[#243444] flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/shop"
            className="px-5 py-2.5 border border-[#DCE5EA] dark:border-[#243444] hover:bg-slate-100 dark:hover:bg-[#1F2E3D] text-[#52667A] dark:text-[#9DB0C0] font-semibold text-xs rounded-xl transition-colors"
          >
            ← Continue Shopping
          </Link>

          <Link
            href={`/track-order/${order.id}`}
            className="px-6 py-2.5 btn-aqua font-bold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <span>Live Order Tracking</span>
            <ArrowRight className="w-4 h-4 text-[#112233]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
