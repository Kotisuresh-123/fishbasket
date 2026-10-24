import { describe, it, expect } from 'vitest';
import { calculateCartItemPrice, calculateCartSummary, calculateNetYield, formatINR } from '../cartUtils';
import { Product, ProductVariant, PreparationOption, CartItem } from '@/types';

const mockProduct: Product = {
  id: 'p1',
  category_id: 'c1',
  name: 'Rohu Fish',
  slug: 'rohu-fish',
  origin_source: 'Godavari',
  description: 'Fresh catch',
  price_per_unit: 280,
  unit: 'kg',
  discount_price: 249,
  freshness: 'fresh_catch',
  stock_quantity: 10,
  min_order_qty: 1,
  is_available: true,
  is_featured: true,
  is_bestseller: true,
  gross_weight_text: '1000g',
  net_yield_text: '750g',
  estimated_prep_minutes: 15,
  storage_instructions: 'Keep chilled',
  allergen_info: 'Finfish',
  image_url: 'https://example.com/fish.jpg',
  variants: [],
  preparation_options: [],
};

const mockVariant: ProductVariant = {
  id: 'v1',
  product_id: 'p1',
  variant_name: '500g Pack',
  weight_grams: 500,
  price: 150,
  discount_price: 139,
  stock_quantity: 5,
};

const mockPrep: PreparationOption = {
  id: 'prep1',
  product_id: 'p1',
  name: 'Fry Cut',
  description: 'Thin steaks',
  extra_price: 25,
  est_weight_loss_percent: 30,
  is_default: false,
};

describe('calculateCartItemPrice', () => {
  it('calculates price using product discount price when no variant is selected', () => {
    const { unitPrice, cleaningFee, singleItemTotal } = calculateCartItemPrice(mockProduct);
    expect(unitPrice).toBe(249);
    expect(cleaningFee).toBe(0);
    expect(singleItemTotal).toBe(249);
  });

  it('calculates price using variant discount price and prep fee', () => {
    const { unitPrice, cleaningFee, singleItemTotal } = calculateCartItemPrice(mockProduct, mockVariant, mockPrep);
    expect(unitPrice).toBe(139);
    expect(cleaningFee).toBe(25);
    expect(singleItemTotal).toBe(164);
  });
});

describe('calculateCartSummary', () => {
  it('calculates subtotal, delivery fee, and grand total under free delivery threshold', () => {
    const cartItems: CartItem[] = [
      {
        id: 'ci1',
        product_id: 'p1',
        product: mockProduct,
        quantity: 1,
        unit_price: 249,
        cleaning_fee: 20,
        item_total: 269,
      },
    ];

    // Under ₹499 threshold, delivery fee is ₹49
    const summary = calculateCartSummary(cartItems, 0, 499, 49);
    expect(summary.itemsCount).toBe(1);
    expect(summary.subtotal).toBe(249);
    expect(summary.cleaningFeeTotal).toBe(20);
    expect(summary.deliveryFee).toBe(49);
    expect(summary.totalAmount).toBe(249 + 20 + 49);
    expect(summary.amountNeededForFreeDelivery).toBe(250);
  });

  it('provides free delivery when subtotal meets or exceeds threshold', () => {
    const cartItems: CartItem[] = [
      {
        id: 'ci1',
        product_id: 'p1',
        product: mockProduct,
        quantity: 2,
        unit_price: 260,
        cleaning_fee: 0,
        item_total: 520,
      },
    ];

    const summary = calculateCartSummary(cartItems, 50, 499, 49);
    expect(summary.subtotal).toBe(520);
    expect(summary.deliveryFee).toBe(0);
    expect(summary.discountAmount).toBe(50);
    expect(summary.totalAmount).toBe(470);
  });
});

describe('calculateNetYield', () => {
  it('computes net cleaned weight accurately based on prep waste percentage', () => {
    const yieldInfo = calculateNetYield(1000, mockPrep);
    expect(yieldInfo.grossGrams).toBe(1000);
    expect(yieldInfo.lossPercent).toBe(30);
    expect(yieldInfo.lossGrams).toBe(300);
    expect(yieldInfo.netGrams).toBe(700);
  });
});

describe('formatINR', () => {
  it('formats Indian rupee amounts correctly', () => {
    const formatted = formatINR(549);
    expect(formatted).toContain('549');
  });
});
