// ====================================================================
// FISH BASKET — CART & PRICE CALCULATION ENGINE
// Recalculates all line items, preparation fees, coupons, and delivery thresholds
// ====================================================================

import { CartItem, Product, ProductVariant, PreparationOption } from '@/types';

export interface CartCalculationResult {
  itemsCount: number;
  subtotal: number;
  cleaningFeeTotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export function calculateCartItemPrice(
  product: Product,
  variant?: ProductVariant,
  preparation?: PreparationOption
): { unitPrice: number; cleaningFee: number; singleItemTotal: number } {
  // Use variant price if selected, otherwise product price
  const unitPrice = variant
    ? (variant.discount_price ?? variant.price)
    : (product.discount_price ?? product.price_per_unit);

  const cleaningFee = preparation ? preparation.extra_price : 0;
  const singleItemTotal = unitPrice + cleaningFee;

  return { unitPrice, cleaningFee, singleItemTotal };
}

export function calculateCartSummary(
  items: CartItem[],
  discountAmount = 0,
  freeDeliveryThreshold = 499,
  baseDeliveryFee = 49,
  taxPercentage = 0
): CartCalculationResult {
  let subtotal = 0;
  let cleaningFeeTotal = 0;
  let itemsCount = 0;

  for (const item of items) {
    const itemSubtotal = item.unit_price * item.quantity;
    const itemCleaning = (item.cleaning_fee || 0) * item.quantity;

    subtotal += itemSubtotal;
    cleaningFeeTotal += itemCleaning;
    itemsCount += item.quantity;
  }

  // Delivery fee rules
  const deliveryFee = subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  // Taxes (0% for raw seafood, configurable)
  const taxableAmount = Math.max(0, subtotal + cleaningFeeTotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * taxPercentage) / 100);

  // Grand Total
  const totalAmount = Math.max(0, subtotal + cleaningFeeTotal + deliveryFee - discountAmount + taxAmount);

  return {
    itemsCount,
    subtotal,
    cleaningFeeTotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountNeededForFreeDelivery,
    discountAmount,
    taxAmount,
    totalAmount,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateNetYield(grossGrams: number, prepOption?: PreparationOption): {
  grossGrams: number;
  netGrams: number;
  lossGrams: number;
  lossPercent: number;
} {
  const lossPercent = prepOption?.est_weight_loss_percent ?? 0;
  const lossGrams = Math.round((grossGrams * lossPercent) / 100);
  const netGrams = grossGrams - lossGrams;

  return {
    grossGrams,
    netGrams,
    lossGrams,
    lossPercent,
  };
}
