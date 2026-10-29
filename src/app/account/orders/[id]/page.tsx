import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import { formatINR } from '@/lib/cartUtils';
import { Package, Truck, ArrowLeft, Printer, MapPin, Clock } from 'lucide-react';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await dbService.getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-[#00D2C4] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
              Order {order.order_number}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-500/10 text-teal-700 dark:text-[#00D2C4] border border-teal-500/20">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <Link
          href={`/track-order/${order.id}`}
          className="px-4 py-2 btn-aqua font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Live Tracking</span>
        </Link>
      </div>

      {/* Main Order Card */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-xs space-y-6 text-xs">
        {/* Destination & Timing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block text-[10px] mb-1">
              Delivery Destination
            </span>
            <div className="font-bold text-[var(--text-primary)]">{order.delivery_address.recipient_name}</div>
            <div className="text-[var(--text-secondary)]">{order.delivery_address.house_flat}, {order.delivery_address.street_locality}</div>
            <div className="text-[var(--text-primary)] font-semibold">{order.delivery_address.city} - {order.delivery_address.pincode}</div>
            <div className="text-[var(--text-secondary)] mt-1">Phone: {order.delivery_address.phone}</div>
          </div>

          <div>
            <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider block text-[10px] mb-1">
              Delivery Slot & Payment
            </span>
            <div className="text-[var(--text-primary)] font-semibold">{order.delivery_slot.name}</div>
            <div className="text-[var(--text-secondary)] mt-1">
              Payment: <strong className="uppercase text-[var(--text-primary)]">{order.payment_method}</strong> ({order.payment_status})
            </div>
            {order.delivery_notes && (
              <div className="text-[var(--text-secondary)] mt-1">Notes: {order.delivery_notes}</div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Itemized Catch Snapshot</h3>
            {order.seller_name && (
              <span className="text-xs text-teal-700 dark:text-[#00D2C4] font-semibold bg-teal-500/10 px-2.5 py-1 rounded-xl border border-teal-500/20">
                Supplied by: <strong>{order.seller_name}</strong>
              </span>
            )}
          </div>
          <div className="border border-[var(--border)] rounded-xl overflow-hidden divide-y divide-[var(--border)]">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{item.product_name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {item.variant_name} • {item.preparation_name}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {formatINR(item.unit_price + item.cleaning_fee)} × {item.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[var(--text-primary)] text-sm">
                    {formatINR(item.item_total)}
                  </div>
                  {order.status === 'delivered' && (
                    <Link
                      href={item.product_slug ? `/product/${item.product_slug}` : '/shop'}
                      className="text-[11px] font-bold text-teal-600 dark:text-[#00D2C4] hover:underline block mt-0.5"
                    >
                      Write Catch Review ★
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-[var(--border)] pt-4 space-y-2 max-w-xs ml-auto text-[var(--text-secondary)]">
          <div className="flex justify-between">
            <span>Item Subtotal:</span>
            <span className="font-semibold text-[var(--text-primary)]">{formatINR(order.subtotal)}</span>
          </div>
          {order.cleaning_fee_total > 0 && (
            <div className="flex justify-between">
              <span>Cleaning & Cut Charges:</span>
              <span className="font-semibold text-[var(--text-primary)]">{formatINR(order.cleaning_fee_total)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Cold-Chain Delivery:</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {order.delivery_fee === 0 ? 'FREE' : formatINR(order.delivery_fee)}
            </span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-teal-600 dark:text-[#00D2C4] font-bold">
              <span>Discount ({order.coupon_code}):</span>
              <span>-{formatINR(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-[var(--text-primary)] pt-2 border-t border-[var(--border)]">
            <span>Paid Amount:</span>
            <span className="text-teal-700 dark:text-[#00D2C4] text-base">{formatINR(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
