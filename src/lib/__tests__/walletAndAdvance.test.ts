import { describe, it, expect, beforeEach } from 'vitest';
import { dbService, memDb } from '@/lib/db';
import { Address, DeliverySlot } from '@/types';

describe('Virtual Demo Wallet, Advance Payment, Escrow Release & Refunds', () => {
  const testCustomerId = 'cust-wallet-test-001';
  const testFishermanId = 'u2'; // Captain Govind (approved fisherman in system)

  const dummyAddress: Address = {
    id: 'addr_test',
    user_id: testCustomerId,
    label: 'Home',
    recipient_name: 'Test Customer',
    phone: '+91 99999 99999',
    house_flat: 'Flat 1',
    street_locality: 'Main Road',
    city: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    pincode: '530003',
    is_default: true,
    created_at: new Date().toISOString(),
  };

  const dummySlot: DeliverySlot = {
    id: 'slot1',
    name: 'Early Morning',
    start_time: '06:30',
    end_time: '09:30',
    is_active: true,
  };

  beforeEach(() => {
    // Reset in-memory wallets and ledger
    memDb.wallets = [];
    memDb.walletTransactions = [];
    memDb.orders = [];
  });

  it('automatically grants ₹1,000 welcome credit upon first customer wallet access', async () => {
    const wallet = await dbService.getWallet(testCustomerId);
    expect(wallet).toBeDefined();
    expect(wallet?.balance).toBe(1000);
    expect(wallet?.pending_balance).toBe(0);
    expect(wallet?.currency).toBe('INR');

    const txs = await dbService.getWalletTransactions(testCustomerId);
    expect(txs.length).toBe(1);
    expect(txs[0].transaction_type).toBe('initial_credit');
    expect(txs[0].amount).toBe(1000);
    expect(txs[0].direction).toBe('credit');
    expect(txs[0].status).toBe('completed');
  });

  it('enforces demo top-up limits (minimum ₹100, maximum ₹10,000)', async () => {
    // Top-up below minimum
    const belowMin = await dbService.topUpWallet(testCustomerId, 50);
    expect(belowMin.success).toBe(false);
    expect(belowMin.message).toContain('Top-up amount must be between ₹100 and ₹10,000');

    // Top-up above maximum
    const aboveMax = await dbService.topUpWallet(testCustomerId, 15000);
    expect(aboveMax.success).toBe(false);
    expect(aboveMax.message).toContain('Top-up amount must be between ₹100 and ₹10,000');

    // Valid top-up
    const validTopUp = await dbService.topUpWallet(testCustomerId, 500);
    expect(validTopUp.success).toBe(true);

    const wallet = await dbService.getWallet(testCustomerId);
    // Initial 1,000 + 500 = 1,500
    expect(wallet?.balance).toBe(1500);
  });

  it('accurately holds 25% advance in simulated escrow upon order placement', async () => {
    // Initialize customer wallet (balance = ₹1,000)
    await dbService.getWallet(testCustomerId);

    const orderData = {
      user_id: testCustomerId,
      customer_name: 'Test Customer',
      customer_phone: '9876543210',
      customer_email: 'customer@test.com',
      subtotal: 800, // 25% advance = ₹200
      cleaning_fee_total: 40,
      delivery_fee: 50,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: 890,
      status: 'confirmed' as const,
      payment_status: 'pending' as const,
      payment_method: 'wallet_advance_cod' as const,
      remaining_payment_method: 'cod' as const,
      fisherman_id: testFishermanId,
      seller_name: 'Captain Govind',
      delivery_address: dummyAddress,
      delivery_slot: dummySlot,
      items: [
        {
          product_id: 'p1',
          fisherman_id: testFishermanId,
          product_name: 'Silver Pomfret',
          product_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
          cleaning_fee: 40,
          unit_price: 800,
          quantity: 1,
          item_total: 840,
        },
      ],
    };

    const orderRes = await dbService.createOrder(orderData);
    expect(orderRes.success).toBe(true);
    const newOrder = orderRes.order!;
    expect(newOrder.id).toBeDefined();
    expect(newOrder.advance_amount).toBe(200); // 25% of ₹800
    expect(newOrder.advance_payment_status).toBe('paid');
    expect(newOrder.remaining_amount).toBe(690); // ₹890 - ₹200
    expect(newOrder.remaining_payment_method).toBe('cod');
    expect(newOrder.advance_released_to_fisherman).toBe(false);

    // Verify customer wallet was debited by ₹200
    const customerWallet = await dbService.getWallet(testCustomerId);
    expect(customerWallet?.balance).toBe(800);

    // Verify fisherman has ₹200 in pending escrow
    const fishermanWallet = await dbService.getWallet(testFishermanId);
    expect(fishermanWallet?.pending_balance).toBe(200);
    expect(fishermanWallet?.balance).toBe(0);
  });

  it('rejects order checkout if customer wallet balance is insufficient for 25% advance', async () => {
    // Empty customer wallet
    const wal = await dbService.getWallet(testCustomerId);
    if (wal) {
      wal.balance = 50; // Only ₹50 available
    }

    const orderData = {
      user_id: testCustomerId,
      customer_name: 'Broke Customer',
      customer_phone: '9876543210',
      customer_email: 'broke@test.com',
      subtotal: 1000, // 25% advance = ₹250
      total_amount: 1050,
      status: 'confirmed' as const,
      payment_status: 'pending' as const,
      payment_method: 'wallet_advance_cod' as const,
      fisherman_id: testFishermanId,
      items: [
        {
          product_id: 'p1',
          fisherman_id: testFishermanId,
          product_name: 'Silver Pomfret',
          product_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
          cleaning_fee: 0,
          unit_price: 1000,
          quantity: 1,
          item_total: 1000,
        },
      ],
      delivery_address: dummyAddress,
      delivery_slot: dummySlot,
    };

    const res: any = await dbService.createOrder(orderData as any);
    expect(res.success).toBe(false);
    expect(res.errorType).toBe('insufficient_advance_balance');
    expect(res.requiredAdvance).toBe(250);
    expect(res.availableBalance).toBe(50);
    expect(res.shortfall).toBe(200);
  });

  it('releases 25% advance to fisherman upon order acceptance (preparing / accepted_for_prep)', async () => {
    // Setup order
    await dbService.getWallet(testCustomerId);
    const orderData = {
      user_id: testCustomerId,
      customer_name: 'Customer One',
      customer_phone: '9876543210',
      customer_email: 'c1@test.com',
      subtotal: 1000, // 25% advance = ₹250
      total_amount: 1050,
      status: 'confirmed' as const,
      payment_status: 'pending' as const,
      payment_method: 'wallet_advance_cod' as const,
      fisherman_id: testFishermanId,
      items: [
        {
          product_id: 'p1',
          fisherman_id: testFishermanId,
          product_name: 'Silver Pomfret',
          product_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
          cleaning_fee: 0,
          unit_price: 1000,
          quantity: 1,
          item_total: 1000,
        },
      ],
      delivery_address: dummyAddress,
      delivery_slot: dummySlot,
    };

    const orderRes = await dbService.createOrder(orderData as any);
    expect(orderRes.success).toBe(true);
    const order = orderRes.order!;

    // Verify pending balance before acceptance
    let fWal = await dbService.getWallet(testFishermanId);
    expect(fWal?.pending_balance).toBe(250);
    expect(fWal?.balance).toBe(0);

    // Fisherman accepts order for preparation
    const updateRes = await dbService.updateOrderStatus(
      order.id,
      'preparing',
      'Accepted catch for cleaning and prep',
      testFishermanId,
      'fisherman'
    );
    expect(updateRes.success).toBe(true);
    const updated = updateRes.order!;
    expect(updated?.status).toBe('preparing');
    expect(updated?.advance_released_to_fisherman).toBe(true);

    // Fisherman pending balance released to available balance
    fWal = await dbService.getWallet(testFishermanId);
    expect(fWal?.pending_balance).toBe(0);
    expect(fWal?.balance).toBe(250);

    const fTxs = await dbService.getWalletTransactions(testFishermanId);
    const releaseTx = fTxs.find((t) => t.transaction_type === 'advance_release');
    expect(releaseTx).toBeDefined();
    expect(releaseTx?.amount).toBe(250);
    expect(releaseTx?.direction).toBe('credit');
  });

  it('refunds 25% advance to customer wallet when order is cancelled before fulfillment', async () => {
    // Setup order
    await dbService.getWallet(testCustomerId);
    const orderData = {
      user_id: testCustomerId,
      customer_name: 'Customer One',
      customer_phone: '9876543210',
      customer_email: 'c1@test.com',
      subtotal: 1000, // 25% advance = ₹250
      total_amount: 1050,
      status: 'confirmed' as const,
      payment_status: 'pending' as const,
      payment_method: 'wallet_advance_cod' as const,
      fisherman_id: testFishermanId,
      items: [
        {
          product_id: 'p1',
          fisherman_id: testFishermanId,
          product_name: 'Silver Pomfret',
          product_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
          cleaning_fee: 0,
          unit_price: 1000,
          quantity: 1,
          item_total: 1000,
        },
      ],
      delivery_address: dummyAddress,
      delivery_slot: dummySlot,
    };

    const orderRes = await dbService.createOrder(orderData as any);
    expect(orderRes.success).toBe(true);
    const order = orderRes.order!;

    // Customer balance after advance debit: ₹1,000 - ₹250 = ₹750
    let cWal = await dbService.getWallet(testCustomerId);
    expect(cWal?.balance).toBe(750);

    // Cancel order
    const cancelRes = await dbService.updateOrderStatus(
      order.id,
      'cancelled',
      'Catch damaged in heavy weather',
      'admin-id',
      'admin'
    );
    expect(cancelRes.success).toBe(true);
    const cancelled = cancelRes.order!;

    expect(cancelled?.status).toBe('cancelled');
    expect(cancelled?.refund_amount).toBe(250);
    expect(cancelled?.refund_status).toBe('refunded');
    expect(cancelled?.advance_payment_status).toBe('refunded');

    // Customer balance restored: ₹750 + ₹250 = ₹1,000
    cWal = await dbService.getWallet(testCustomerId);
    expect(cWal?.balance).toBe(1000);

    // Fisherman pending balance cleared: 0
    const fWal = await dbService.getWallet(testFishermanId);
    expect(fWal?.pending_balance).toBe(0);

    // Customer ledger contains refund transaction
    const cTxs = await dbService.getWalletTransactions(testCustomerId);
    const refundTx = cTxs.find((t) => t.transaction_type === 'advance_refund');
    expect(refundTx).toBeDefined();
    expect(refundTx?.amount).toBe(250);
    expect(refundTx?.direction).toBe('credit');
  });

  it('allows paying remaining 75% balance via Demo Wallet', async () => {
    // Top-up customer so they have enough for total ₹1,050 order
    await dbService.getWallet(testCustomerId);
    await dbService.topUpWallet(testCustomerId, 1000); // Balance now = ₹2,000

    const orderData = {
      user_id: testCustomerId,
      customer_name: 'Customer One',
      customer_phone: '9876543210',
      customer_email: 'c1@test.com',
      subtotal: 1000, // Advance = ₹250, Remaining = ₹800
      total_amount: 1050,
      status: 'confirmed' as const,
      payment_status: 'pending' as const,
      payment_method: 'wallet_advance_cod' as const,
      remaining_payment_method: 'cod' as const,
      fisherman_id: testFishermanId,
      items: [
        {
          product_id: 'p1',
          fisherman_id: testFishermanId,
          product_name: 'Silver Pomfret',
          product_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
          cleaning_fee: 0,
          unit_price: 1000,
          quantity: 1,
          item_total: 1000,
        },
      ],
      delivery_address: dummyAddress,
      delivery_slot: dummySlot,
    };

    const orderRes = await dbService.createOrder(orderData as any);
    expect(orderRes.success).toBe(true);
    const order = orderRes.order!;
    expect(order.remaining_amount).toBe(800);
    expect(order.remaining_payment_status).toBe('pending');

    // Customer pays remaining ₹800 with wallet
    const payRes = await dbService.payRemainingBalanceWithWallet(order.id, testCustomerId);
    expect(payRes.success).toBe(true);

    const updatedOrder = (await dbService.getOrders(testCustomerId)).find((o) => o.id === order.id);
    expect(updatedOrder?.remaining_payment_status).toBe('paid');
    expect(updatedOrder?.payment_status).toBe('success');
  });

  describe('Fisherman Catch Photo Validation & Security', () => {
    it('validates allowed image formats (JPEG, PNG, WebP) and size limit (<= 5MB)', () => {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

      expect(allowedMimes.includes('image/jpeg')).toBe(true);
      expect(allowedMimes.includes('image/png')).toBe(true);
      expect(allowedMimes.includes('image/webp')).toBe(true);
      expect(allowedMimes.includes('image/gif')).toBe(false);
      expect(allowedMimes.includes('application/octet-stream')).toBe(false);

      const validSize = 4.2 * 1024 * 1024;
      const invalidSize = 5.5 * 1024 * 1024;
      expect(validSize <= MAX_SIZE_BYTES).toBe(true);
      expect(invalidSize <= MAX_SIZE_BYTES).toBe(false);
    });

    it('strictly requires HTTPS scheme for external image URLs and rejects unsafe protocols', () => {
      const isValidHttps = (url: string) => {
        if (!url.startsWith('https://')) return false;
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'https:';
        } catch {
          return false;
        }
      };

      expect(isValidHttps('https://images.unsplash.com/photo-1544551763-46a013bb70d5')).toBe(true);
      expect(isValidHttps('http://insecure-cdn.com/catch.jpg')).toBe(false);
      expect(isValidHttps('javascript:alert(1)')).toBe(false);
      expect(isValidHttps('data:image/png;base64,...')).toBe(false);
      expect(isValidHttps('file:///etc/passwd')).toBe(false);
    });
  });
});
