'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, Product, ProductVariant, PreparationOption, Coupon } from '@/types';
import { calculateCartItemPrice, calculateCartSummary, CartCalculationResult } from '@/lib/cartUtils';

export interface FishermanCartGroup {
  fishermanId: string;
  sellerName: string;
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  cleaningFeeTotal: number;
  totalAmount: number;
}

interface CartContextType {
  items: CartItem[];
  itemsCount: number;
  isCartOpen: boolean;
  coupon: Coupon | null;
  discountAmount: number;
  couponMessage: string | null;
  summary: CartCalculationResult;
  fishermanGroups: FishermanCartGroup[];
  hasMultipleFishermen: boolean;
  selectedCheckoutFishermanId: string | null;
  setSelectedCheckoutFishermanId: (id: string | null) => void;
  getCheckoutItemsForFisherman: (fishermanId?: string | null) => CartItem[];
  getCheckoutSummaryForFisherman: (fishermanId?: string | null) => CartCalculationResult;
  clearFishermanCart: (fishermanId: string) => void;
  addItem: (
    product: Product,
    variant?: ProductVariant,
    prep?: PreparationOption,
    quantity?: number,
    customInstructions?: string
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  updateItemOptions: (itemId: string, variant?: ProductVariant, prep?: PreparationOption) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'fishbasket_cart_v2';
const COUPON_STORAGE_KEY = 'fishbasket_coupon_v2';
const CHECKOUT_SELLER_KEY = 'fishbasket_checkout_seller_v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedCheckoutFishermanId, setSelectedCheckoutFishermanIdState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        setCoupon(parsed.coupon);
        setDiscountAmount(parsed.discountAmount);
      }
      const savedSeller = localStorage.getItem(CHECKOUT_SELLER_KEY);
      if (savedSeller) {
        setSelectedCheckoutFishermanIdState(savedSeller);
      }
    } catch {
      // Ignore storage read error
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write error
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (coupon) {
        localStorage.setItem(
          COUPON_STORAGE_KEY,
          JSON.stringify({ coupon, discountAmount })
        );
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Ignore storage write error
    }
  }, [coupon, discountAmount, isInitialized]);

  const setSelectedCheckoutFishermanId = (id: string | null) => {
    setSelectedCheckoutFishermanIdState(id);
    try {
      if (id) {
        localStorage.setItem(CHECKOUT_SELLER_KEY, id);
      } else {
        localStorage.removeItem(CHECKOUT_SELLER_KEY);
      }
    } catch {
      // Ignore
    }
  };

  // Group items by fisherman/seller
  const fishermanGroups: FishermanCartGroup[] = useMemo(() => {
    const map = new Map<string, FishermanCartGroup>();
    items.forEach((item) => {
      const fId = item.product.fisherman_id || 'platform';
      const sName = item.product.seller_name || 'Visakha Harbor Cooperative';
      if (!map.has(fId)) {
        map.set(fId, {
          fishermanId: fId,
          sellerName: sName,
          items: [],
          itemsCount: 0,
          subtotal: 0,
          cleaningFeeTotal: 0,
          totalAmount: 0,
        });
      }
      const group = map.get(fId)!;
      group.items.push(item);
      group.itemsCount += item.quantity;
      group.subtotal += item.item_total;
      group.cleaningFeeTotal += item.cleaning_fee * item.quantity;
      group.totalAmount += item.item_total;
    });
    return Array.from(map.values());
  }, [items]);

  const hasMultipleFishermen = fishermanGroups.length > 1;

  // Active checkout items for a given fisherman
  const getCheckoutItemsForFisherman = (targetFishermanId?: string | null): CartItem[] => {
    if (items.length === 0) return [];
    if (!hasMultipleFishermen) return items;

    const fId = targetFishermanId || selectedCheckoutFishermanId || fishermanGroups[0]?.fishermanId;
    return items.filter((item) => (item.product.fisherman_id || 'platform') === fId);
  };

  const getCheckoutSummaryForFisherman = (targetFishermanId?: string | null): CartCalculationResult => {
    const checkoutItems = getCheckoutItemsForFisherman(targetFishermanId);
    return calculateCartSummary(checkoutItems, discountAmount, 499, 49, 0);
  };

  // Global cart summary
  const summary = calculateCartSummary(items, discountAmount, 499, 49, 0);

  // If subtotal drops below coupon minimum, auto-adjust or invalidate
  useEffect(() => {
    if (coupon && summary.subtotal < coupon.min_order_amount) {
      setCoupon(null);
      setDiscountAmount(0);
      setCouponMessage(`Coupon ${coupon.code} removed (Subtotal under ₹${coupon.min_order_amount})`);
    }
  }, [items, coupon, summary.subtotal]);

  const addItem = (
    product: Product,
    variant?: ProductVariant,
    prep?: PreparationOption,
    quantity = 1,
    customInstructions?: string
  ) => {
    setItems((prevItems) => {
      const selectedPrep =
        prep || product.preparation_options.find((p) => p.is_default) || product.preparation_options[0];
      const selectedVariant = variant || product.variants[0];

      const { unitPrice, cleaningFee } = calculateCartItemPrice(
        product,
        selectedVariant,
        selectedPrep
      );

      const existingIdx = prevItems.findIndex(
        (item) =>
          item.product_id === product.id &&
          item.variant?.id === selectedVariant?.id &&
          item.preparation_option?.id === selectedPrep?.id
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          item_total: (unitPrice + cleaningFee) * newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: 'cart_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        product_id: product.id,
        product,
        variant: selectedVariant,
        preparation_option: selectedPrep,
        quantity,
        custom_instructions: customInstructions,
        unit_price: unitPrice,
        cleaning_fee: cleaningFee,
        item_total: (unitPrice + cleaningFee) * quantity,
      };

      return [newItem, ...prevItems];
    });

    setIsCartOpen(true);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              item_total: (item.unit_price + item.cleaning_fee) * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateItemOptions = (
    itemId: string,
    variant?: ProductVariant,
    prep?: PreparationOption
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newVariant = variant || item.variant;
          const newPrep = prep || item.preparation_option;
          const { unitPrice, cleaningFee } = calculateCartItemPrice(
            item.product,
            newVariant,
            newPrep
          );
          return {
            ...item,
            variant: newVariant,
            preparation_option: newPrep,
            unit_price: unitPrice,
            cleaning_fee: cleaningFee,
            item_total: (unitPrice + cleaningFee) * item.quantity,
          };
        }
        return item;
      })
    );
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${summary.subtotal}`);
      const data = await res.json();
      if (data.valid) {
        setCoupon(data.coupon);
        setDiscountAmount(data.discount);
        setCouponMessage(data.message);
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch {
      return { success: false, message: 'Failed to validate coupon code.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
    setCouponMessage(null);
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setDiscountAmount(0);
    setCouponMessage(null);
    setSelectedCheckoutFishermanId(null);
  };

  const clearFishermanCart = (fishermanId: string) => {
    setItems((prev) => prev.filter((item) => (item.product.fisherman_id || 'platform') !== fishermanId));
    setSelectedCheckoutFishermanId(null);
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount: summary.itemsCount,
        isCartOpen,
        coupon,
        discountAmount,
        couponMessage,
        summary,
        fishermanGroups,
        hasMultipleFishermen,
        selectedCheckoutFishermanId,
        setSelectedCheckoutFishermanId,
        getCheckoutItemsForFisherman,
        getCheckoutSummaryForFisherman,
        clearFishermanCart,
        addItem,
        removeItem,
        updateQuantity,
        updateItemOptions,
        applyCoupon,
        removeCoupon,
        clearCart,
        setIsCartOpen,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
