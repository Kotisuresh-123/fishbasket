'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { INITIAL_DELIVERY_SLOTS } from '@/data/mockData';
import { Address, DeliverySlot, Wallet } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  Check,
  ArrowRight,
  Truck,
  MapPin,
  Clock,
  Banknote,
  AlertCircle,
  Lock,
  Anchor,
  User,
  Wallet as WalletIcon,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    selectedCheckoutFishermanId,
    getCheckoutItemsForFisherman,
    getCheckoutSummaryForFisherman,
    clearFishermanCart,
    coupon,
  } = useCart();
  const { user, addresses } = useAuth();
  const { selectedPincode, availableZones } = useLocation();

  // Active items and summary for the selected fisherman
  const checkoutItems = getCheckoutItemsForFisherman(selectedCheckoutFishermanId);
  const checkoutSummary = getCheckoutSummaryForFisherman(selectedCheckoutFishermanId);

  // Identify the seller
  const activeSellerName = checkoutItems[0]?.product.seller_name || 'Visakha Harbor Cooperative';
  const activeFishermanId = checkoutItems[0]?.product.fisherman_id || selectedCheckoutFishermanId || 'platform';

  // 25% advance calculation on eligible fish subtotal
  const advanceAmount = Math.round(checkoutSummary.subtotal * 0.25 * 100) / 100;
  const remainingAmount = Math.round((checkoutSummary.totalAmount - advanceAmount) * 100) / 100;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Wallet & Payment State
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [remainingOption, setRemainingOption] = useState<'cod' | 'wallet'>('cod');
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topUpMsg, setTopUpMsg] = useState<string | null>(null);

  // Form State
  const [contactName, setContactName] = useState(user?.full_name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');

  // Address State
  const [selectedAddressId] = useState<string>(
    addresses[0]?.id || 'new'
  );
  const [houseFlat, setHouseFlat] = useState(addresses[0]?.house_flat || 'Flat 402, Sea Pearl Apts');
  const [streetLocality, setStreetLocality] = useState(addresses[0]?.street_locality || 'Beach Road, Pandurangapuram');
  const [landmark, setLandmark] = useState(addresses[0]?.landmark || 'Near Submarine Museum');
  const [pincode, setPincode] = useState(addresses[0]?.pincode || selectedPincode || '530003');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Slot State
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot>(INITIAL_DELIVERY_SLOTS[0]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Validate Serviceability
  const activeZone = availableZones.find((z) => z.pincode === pincode.trim());
  const isPincodeServiceable = activeZone ? activeZone.is_serviceable : false;

  useEffect(() => {
    if (checkoutItems.length === 0) {
      router.push('/cart');
    }
  }, [checkoutItems, router]);

  // Load customer demo wallet
  useEffect(() => {
    fetch('/api/wallet')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.wallet) {
          setWallet(data.wallet);
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickTopUp = async (amount: number) => {
    setIsToppingUp(true);
    setTopUpMsg(null);
    setOrderError(null);
    try {
      const res = await fetch('/api/wallet/top-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, idempotencyKey: `topup_chk_${Date.now()}` }),
      });
      const data = await res.json();
      if (data.success && data.wallet) {
        setWallet(data.wallet);
        setTopUpMsg(`✓ Added ₹${amount} Demo Credits to your wallet!`);
      } else {
        setOrderError(data.message || 'Failed to top up demo wallet.');
      }
    } catch {
      setOrderError('Network error while adding demo credits.');
    } finally {
      setIsToppingUp(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isPincodeServiceable) {
      setOrderError('Selected PIN code is outside our serviceable cold-chain delivery zone.');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    const deliveryAddressSnapshot: Address = {
      id: selectedAddressId !== 'new' ? selectedAddressId : 'addr_' + Date.now(),
      user_id: user?.id || 'u1',
      label: 'Home',
      recipient_name: contactName,
      phone: contactPhone,
      house_flat: houseFlat,
      street_locality: streetLocality,
      landmark,
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      pincode: pincode.trim(),
      is_default: true,
      delivery_instructions: deliveryNotes,
      created_at: new Date().toISOString(),
    };

    // 25% Advance payment via Demo Wallet + Remaining Option
    const orderPayload = {
      user_id: user?.id || 'u1',
      customer_name: contactName,
      customer_phone: contactPhone,
      customer_email: contactEmail,
      status: 'confirmed' as const,
      subtotal: checkoutSummary.subtotal,
      cleaning_fee_total: checkoutSummary.cleaningFeeTotal,
      delivery_fee: checkoutSummary.deliveryFee,
      discount_amount: checkoutSummary.discountAmount,
      tax_amount: checkoutSummary.taxAmount,
      total_amount: checkoutSummary.totalAmount,
      coupon_code: coupon?.code,
      delivery_address: deliveryAddressSnapshot,
      delivery_slot: selectedSlot,
      delivery_notes: deliveryNotes,
      fisherman_id: activeFishermanId,
      seller_name: activeSellerName,
      payment_method: remainingOption === 'wallet' ? ('wallet' as const) : ('wallet_advance_cod' as const),
      remaining_payment_method: remainingOption,
      payment_status: remainingOption === 'wallet' ? ('success' as const) : ('pending' as const),
      items: checkoutItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product.name,
        product_image: item.product.image_url,
        variant_name: item.variant?.variant_name,
        weight_grams: item.variant?.weight_grams,
        preparation_name: item.preparation_option?.name,
        cleaning_fee: item.cleaning_fee,
        unit_price: item.unit_price,
        quantity: item.quantity,
        item_total: item.item_total,
        fisherman_id: item.product.fisherman_id,
        seller_name: item.product.seller_name,
      })),
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        // Clear only this fisherman's items from the cart
        clearFishermanCart(activeFishermanId);
        router.push(`/order-confirmation/${data.order.id}`);
      } else {
        setOrderError(data.message || 'Failed to place order. Please try again.');
        setIsSubmitting(false);
      }
    } catch {
      setOrderError('Network error while placing order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#7E92A2] dark:text-[#6B7F91] mb-6">
        <Link href="/cart" className="hover:text-[#00D2C4] transition-colors">Cart</Link>
        <span>/</span>
        <span className="text-[#112233] dark:text-[#EAF2F8] font-semibold">Single-Fisherman Checkout</span>
      </div>

      {/* Seller Header Banner */}
      <div className="mb-6 p-4 bg-[#00D2C4]/10 dark:bg-[#00D2C4]/15 border border-[#00D2C4]/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D2C4] text-[#112233] flex items-center justify-center font-bold">
            <Anchor className="w-5 h-5 text-[#112233]" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[#009E93] dark:text-[#00D2C4] tracking-wider block">
              Direct Harbor Checkout
            </span>
            <h2 className="text-sm sm:text-base font-black text-[#112233] dark:text-[#EAF2F8]">
              Fisherman: {activeSellerName}
            </h2>
          </div>
        </div>

        <div className="text-xs text-[#009E93] dark:text-[#00D2C4] bg-white/80 dark:bg-[#17232E]/80 px-3 py-1.5 rounded-xl border border-[#00D2C4]/30 self-start sm:self-auto font-semibold">
          {checkoutItems.length} {checkoutItems.length === 1 ? 'item' : 'items'} in this order • Cash on Delivery
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Step Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Progress Indicator */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            <button
              onClick={() => setStep(1)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                step >= 1
                  ? 'border-[#00D2C4] bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-black'
                  : 'border-[#DCE5EA] dark:border-[#243444] text-[#7E92A2] dark:text-[#6B7F91]'
              }`}
            >
              1. Contact
            </button>
            <button
              onClick={() => setStep(2)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                step >= 2
                  ? 'border-[#00D2C4] bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-black'
                  : 'border-[#DCE5EA] dark:border-[#243444] text-[#7E92A2] dark:text-[#6B7F91]'
              }`}
            >
              2. Address
            </button>
            <button
              onClick={() => setStep(3)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                step >= 3
                  ? 'border-[#00D2C4] bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-black'
                  : 'border-[#DCE5EA] dark:border-[#243444] text-[#7E92A2] dark:text-[#6B7F91]'
              }`}
            >
              3. Slot
            </button>
            <button
              onClick={() => setStep(4)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                step >= 4
                  ? 'border-[#00D2C4] bg-[#00D2C4]/15 text-[#009E93] dark:text-[#00D2C4] font-black'
                  : 'border-[#DCE5EA] dark:border-[#243444] text-[#7E92A2] dark:text-[#6B7F91]'
              }`}
            >
              4. Payment (COD)
            </button>
          </div>

          {/* STEP 1: Contact Details */}
          {step === 1 && (
            <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs space-y-4 transition-colors">
              <h2 className="text-base font-bold text-[#112233] dark:text-[#EAF2F8] flex items-center gap-2 border-b border-[#DCE5EA] dark:border-[#243444] pb-3">
                <User className="w-4 h-4 text-[#00D2C4]" /> 1. Customer Contact Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Mobile Phone (For Delivery SMS)</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Email Address (Order Receipt)</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 btn-aqua font-bold text-xs rounded-xl flex items-center gap-2"
                >
                  <span>Continue to Delivery Address</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#112233]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Address & PIN Validation */}
          {step === 2 && (
            <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-[#DCE5EA] dark:border-[#243444] pb-3">
                <h2 className="text-base font-bold text-[#112233] dark:text-[#EAF2F8] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00D2C4]" /> 2. Delivery Address in Visakhapatnam
                </h2>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-[#009E93] dark:text-[#00D2C4] font-semibold cursor-pointer"
                >
                  Back
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">House / Flat / Apartment No.</label>
                    <input
                      type="text"
                      value={houseFlat}
                      onChange={(e) => setHouseFlat(e.target.value)}
                      placeholder="e.g. Flat 402, Sea Breeze Apts"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Street & Locality</label>
                    <input
                      type="text"
                      value={streetLocality}
                      onChange={(e) => setStreetLocality(e.target.value)}
                      placeholder="e.g. Beach Road, Pandurangapuram"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Submarine Museum"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Visakhapatnam PIN Code</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="530003"
                      maxLength={6}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Serviceability indicator */}
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isPincodeServiceable
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {isPincodeServiceable ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>
                        Serviceable Cold-Chain Zone: <strong>{activeZone?.area_name}</strong> (Est. delivery in 2 hours)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                      <span>PIN Code {pincode} is currently outside our 2-hour cold-chain express radius.</span>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#52667A] dark:text-[#9DB0C0] mb-1">Special Delivery Instructions</label>
                  <textarea
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Please ring bell twice or leave insulated box with gate security."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DCE5EA] dark:border-[#243444] bg-[#EDF3F5] dark:bg-[#0F1820] text-[#112233] dark:text-[#EAF2F8] focus:outline-none focus:border-[#00D2C4] font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-[#DCE5EA] dark:border-[#243444] text-[#52667A] dark:text-[#9DB0C0] hover:bg-slate-100 dark:hover:bg-[#1F2E3D] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!isPincodeServiceable}
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 btn-aqua font-bold text-xs rounded-xl flex items-center gap-2 disabled:opacity-40 cursor-pointer"
                >
                  <span>Select Delivery Slot</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#112233]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Delivery Slot */}
          {step === 3 && (
            <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-[#DCE5EA] dark:border-[#243444] pb-3">
                <h2 className="text-base font-bold text-[#112233] dark:text-[#EAF2F8] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00D2C4]" /> 3. Select Cold-Chain Delivery Slot
                </h2>
                <button
                  onClick={() => setStep(2)}
                  className="text-xs text-[#009E93] dark:text-[#00D2C4] font-semibold cursor-pointer"
                >
                  Back
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INITIAL_DELIVERY_SLOTS.map((slot) => {
                  const isSelected = selectedSlot.id === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#00D2C4] bg-[#00D2C4]/15 text-[#112233] dark:text-[#EAF2F8] font-bold shadow-xs'
                          : 'border-[#DCE5EA] dark:border-[#243444] bg-[#F8FAFA] dark:bg-[#121C25] hover:border-[#00D2C4]/40 text-[#52667A] dark:text-[#9DB0C0]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#00D2C4] flex-shrink-0" />
                        <div>
                          <div className="text-xs">{slot.name}</div>
                          <div className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] font-normal">
                            Fresh harbor cold chain
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#00D2C4] flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-[#DCE5EA] dark:border-[#243444] text-[#52667A] dark:text-[#9DB0C0] hover:bg-slate-100 dark:hover:bg-[#1F2E3D] rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 btn-aqua font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Payment (25% Advance)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#112233]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: 25% Advance Payment + Remaining Balance Option */}
          {step === 4 && (
            <div className="bg-white dark:bg-[#17232E] p-6 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs space-y-6 transition-colors">
              <div className="flex items-center justify-between border-b border-[#DCE5EA] dark:border-[#243444] pb-3">
                <h2 className="text-base font-bold text-[#112233] dark:text-[#EAF2F8] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00D2C4]" /> 4. Payment & 25% Advance Confirmation
                </h2>
                <button
                  onClick={() => setStep(3)}
                  className="text-xs text-[#009E93] dark:text-[#00D2C4] font-semibold cursor-pointer"
                >
                  Back
                </button>
              </div>

              {/* 25% Mandatory Advance Section */}
              <div className="p-4 rounded-2xl bg-teal-500/10 border-2 border-teal-500/40 text-[#112233] dark:text-[#EAF2F8] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#00D2C4] text-[#112233] flex items-center justify-center font-bold flex-shrink-0">
                      <WalletIcon className="w-5 h-5 text-[#112233]" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-teal-700 dark:text-[#00D2C4] tracking-wider block">
                        Mandatory Fisherman Reservation
                      </span>
                      <h3 className="text-sm font-black text-[#112233] dark:text-[#EAF2F8]">
                        25% Virtual Wallet Advance: {formatINR(advanceAmount)}
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] block">Available Demo Balance</span>
                    <span className="text-sm font-black text-teal-600 dark:text-[#00D2C4]">
                      {wallet ? formatINR(wallet.balance) : 'Loading...'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#52667A] dark:text-[#9DB0C0] leading-relaxed">
                  Per Fish Basket policy, a 25% advance on fresh catch is reserved from your <strong>Demo Wallet</strong> into simulated escrow. It is released to {activeSellerName} only after they accept and begin catch preparation.
                </p>

                {/* Balance check & quick simulated top-up */}
                {wallet && wallet.balance < advanceAmount ? (
                  <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>
                        Shortfall: {formatINR(Math.round((advanceAmount - wallet.balance) * 100) / 100)}. Top up demo credits to continue.
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isToppingUp}
                        onClick={() => handleQuickTopUp(500)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+₹500 Demo Credits</span>
                      </button>
                      <button
                        type="button"
                        disabled={isToppingUp}
                        onClick={() => handleQuickTopUp(1000)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+₹1,000 Demo Credits</span>
                      </button>
                      {isToppingUp && <span className="text-[11px] text-amber-600 animate-pulse font-medium">Adding credits...</span>}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Sufficient Demo Wallet Balance. {formatINR(advanceAmount)} will be debited upon order confirmation.</span>
                  </div>
                )}

                {topUpMsg && (
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{topUpMsg}</div>
                )}
              </div>

              {/* Remaining 75% Payment Options */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-[#112233] dark:text-[#EAF2F8]">
                  Select Payment Method for Remaining 75% ({formatINR(remainingAmount)}):
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setRemainingOption('cod')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      remainingOption === 'cod'
                        ? 'border-[#00D2C4] bg-[#00D2C4]/15 shadow-xs font-bold'
                        : 'border-[#DCE5EA] dark:border-[#243444] bg-[#F8FAFA] dark:bg-[#121C25]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <Banknote className="w-5 h-5 text-teal-600 dark:text-[#00D2C4]" />
                        <div>
                          <div className="text-xs font-bold text-[#112233] dark:text-[#EAF2F8]">Cash on Delivery (COD)</div>
                          <div className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] font-normal">
                            Pay {formatINR(remainingAmount)} at doorstep
                          </div>
                        </div>
                      </div>
                      {remainingOption === 'cod' && <Check className="w-4 h-4 text-[#00D2C4]" />}
                    </div>
                  </button>

                  {/* Option B: Demo Wallet */}
                  <button
                    type="button"
                    onClick={() => setRemainingOption('wallet')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      remainingOption === 'wallet'
                        ? 'border-[#00D2C4] bg-[#00D2C4]/15 shadow-xs font-bold'
                        : 'border-[#DCE5EA] dark:border-[#243444] bg-[#F8FAFA] dark:bg-[#121C25]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <WalletIcon className="w-5 h-5 text-teal-600 dark:text-[#00D2C4]" />
                        <div>
                          <div className="text-xs font-bold text-[#112233] dark:text-[#EAF2F8]">Full Demo Wallet Payment</div>
                          <div className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] font-normal">
                            Pay all {formatINR(checkoutSummary.totalAmount)} from wallet
                          </div>
                        </div>
                      </div>
                      {remainingOption === 'wallet' && <Check className="w-4 h-4 text-[#00D2C4]" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Simulation Notice */}
              <div className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-[var(--border)] text-[11px] text-[var(--text-secondary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-[#00D2C4] flex-shrink-0" />
                <span>
                  <strong>Demo Money Notice:</strong> This is an educational marketplace simulation. All balances and transactions use virtual demo credits.
                </span>
              </div>

              {orderError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {orderError}
                </div>
              )}

              {/* Order Placement CTA */}
              <div className="pt-4 border-t border-[#DCE5EA] dark:border-[#243444] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-[#7E92A2] dark:text-[#6B7F91] block">
                    {remainingOption === 'wallet' ? 'Total Debited from Demo Wallet' : '25% Advance Debited Now'}
                  </span>
                  <span className="text-xl font-black text-[#009E93] dark:text-[#00D2C4]">
                    {remainingOption === 'wallet' ? formatINR(checkoutSummary.totalAmount) : formatINR(advanceAmount)}
                  </span>
                  {remainingOption === 'cod' && (
                    <span className="text-[11px] text-[#7E92A2] dark:text-[#6B7F91] block">
                      Remaining {formatINR(remainingAmount)} payable at delivery (COD)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || (wallet ? wallet.balance < advanceAmount : true)}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 btn-aqua font-black text-xs rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Reserving Advance & Placing Order...</span>
                  ) : (
                    <>
                      <span>Pay 25% Advance & Place Order</span>
                      <Check className="w-4 h-4 text-[#112233]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary for this Fisherman */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-[#17232E] p-5 rounded-2xl border border-[#DCE5EA] dark:border-[#243444] shadow-xs space-y-4 transition-colors">
            <div className="border-b border-[#DCE5EA] dark:border-[#243444] pb-3">
              <span className="text-[10px] uppercase font-bold text-[#009E93] dark:text-[#00D2C4] tracking-wider block">
                Order Allocation
              </span>
              <h3 className="font-bold text-sm text-[#112233] dark:text-[#EAF2F8] truncate">
                {activeSellerName}
              </h3>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-[#DCE5EA] dark:divide-[#243444] text-xs">
              {checkoutItems.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-[#112233] dark:text-[#EAF2F8] truncate block">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] text-[#7E92A2] dark:text-[#6B7F91] block">
                      Qty: {item.quantity} • {item.variant?.variant_name}
                    </span>
                  </div>
                  <span className="font-bold text-[#112233] dark:text-[#EAF2F8] flex-shrink-0">
                    {formatINR(item.item_total)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#DCE5EA] dark:border-[#243444] space-y-2 text-xs">
              <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
                <span>Fish Subtotal</span>
                <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{formatINR(checkoutSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-teal-700 dark:text-[#00D2C4] font-semibold">
                <span>25% Advance (Demo Wallet)</span>
                <span>{formatINR(advanceAmount)}</span>
              </div>
              <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
                <span>Remaining Balance ({remainingOption.toUpperCase()})</span>
                <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{formatINR(remainingAmount)}</span>
              </div>
              {checkoutSummary.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(checkoutSummary.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#52667A] dark:text-[#9DB0C0]">
                <span>Cold-Chain Delivery</span>
                <span className="font-semibold text-[#112233] dark:text-[#EAF2F8]">{checkoutSummary.deliveryFee === 0 ? 'FREE' : formatINR(checkoutSummary.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#112233] dark:text-[#EAF2F8] pt-2 border-t border-[#DCE5EA] dark:border-[#243444]">
                <span>Total Order Value</span>
                <span className="text-[#009E93] dark:text-[#00D2C4]">{formatINR(checkoutSummary.totalAmount)}</span>
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFA] dark:bg-[#121C25] rounded-xl text-[11px] text-[#52667A] dark:text-[#9DB0C0] flex items-center gap-2 border border-[#DCE5EA] dark:border-[#243444]">
              <Truck className="w-4 h-4 text-[#00D2C4] flex-shrink-0" />
              <span>Chilled transit with sub-zero ice packs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
