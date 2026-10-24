import { describe, it, expect } from 'vitest';
import { dbService } from '../db';
import { calculateCartItemPrice, calculateCartSummary, calculateNetYield } from '../cartUtils';
import { Product, ProductVariant, PreparationOption } from '@/types';

describe('Fish Basket eCommerce & Multi-Fisherman Marketplace Logic', () => {
  it('validates coupons correctly', async () => {
    // Valid coupon above min order
    const res1 = await dbService.validateCoupon('FRESH100', 800);
    expect(res1.valid).toBe(true);
    expect(res1.discount).toBe(100);

    // Coupon with subtotal below minimum requirement
    const res2 = await dbService.validateCoupon('FRESH100', 400);
    expect(res2.valid).toBe(false);
    expect(res2.discount).toBe(0);

    // Non-existent coupon
    const res3 = await dbService.validateCoupon('INVALID99', 1000);
    expect(res3.valid).toBe(false);
  });

  it('checks pincode serviceability correctly', async () => {
    // Serviceable Visakhapatnam Beach Road PIN
    const zone1 = await dbService.checkPincodeServiceability('530003');
    expect(zone1).not.toBeNull();
    expect(zone1?.area_name).toContain('Beach Road');
    expect(zone1?.is_serviceable).toBe(true);

    // Out of zone PIN
    const zone2 = await dbService.checkPincodeServiceability('999999');
    expect(zone2).toBeNull();
  });

  it('filters seafood catalog by category and search keyword', async () => {
    const pomfretResults = await dbService.getProducts({ search: 'Pomfret' });
    expect(pomfretResults.length).toBeGreaterThan(0);
    expect(pomfretResults[0].name).toContain('Pomfret');

    const prawnResults = await dbService.getProducts({ categorySlug: 'prawns' });
    expect(prawnResults.length).toBeGreaterThan(0);
    expect(prawnResults.every((p) => p.category_slug === 'prawns')).toBe(true);
  });

  // --- Multi-Fisherman Authentication & Registration ---
  it('registers new fishermen with pending status by default', async () => {
    const regRes = await dbService.registerFisherman({
      email: 'test_boat_captain@fishbasket.in',
      password: 'SafePassword123!',
      full_name: 'Captain Prasad',
      display_name: 'Sea Falcon Fishery',
      dock_location: 'Kakinada Deep Sea Port',
    });

    expect(regRes.success).toBe(true);
    expect(regRes.user).toBeDefined();
    expect(regRes.user?.role).toBe('fisherman');
    expect(regRes.user?.status).toBe('pending');

    // Duplicate registration rejected
    const dupRes = await dbService.registerFisherman({
      email: 'test_boat_captain@fishbasket.in',
      password: 'SafePassword123!',
      full_name: 'Captain Prasad',
      display_name: 'Sea Falcon Fishery',
    });
    expect(dupRes.success).toBe(false);
  });

  it('authenticates valid credentials and rejects invalid passwords', async () => {
    // Correct credentials
    const authSuccess = await dbService.authenticate('fisherman1@fishbasket.in', 'FishBasket@2026');
    expect(authSuccess.success).toBe(true);
    expect(authSuccess.user?.role).toBe('fisherman');

    // Incorrect password
    const authFail = await dbService.authenticate('fisherman1@fishbasket.in', 'WrongPassword123');
    expect(authFail.success).toBe(false);
    expect(authFail.user).toBeUndefined();
  });

  // --- Admin Moderation & Approval ---
  it('allows admin to approve, suspend, and reactivate fishermen', async () => {
    const fishermen = await dbService.getFishermen();
    const pendingFisherman = fishermen.find((f) => f.status === 'pending');
    expect(pendingFisherman).toBeDefined();

    if (pendingFisherman) {
      // 1. Approve
      const approved = await dbService.updateFishermanStatus(pendingFisherman.id, 'approved');
      expect(approved).not.toBeNull();
      expect(approved?.status).toBe('approved');

      // 2. Suspend
      const suspended = await dbService.updateFishermanStatus(pendingFisherman.id, 'suspended');
      expect(suspended).not.toBeNull();
      expect(suspended?.status).toBe('suspended');

      // 3. Reactivate
      const reactivated = await dbService.updateFishermanStatus(pendingFisherman.id, 'approved');
      expect(reactivated).not.toBeNull();
      expect(reactivated?.status).toBe('approved');
    }
  });

  it('correctly governs fisherman approval lifecycle: pending is blocked, approved can add catch, suspended is blocked', async () => {
    // 1. Register a new fisherman (starts in pending)
    const newCap = await dbService.registerFisherman({
      email: 'cap_lifecycle@fishbasket.in',
      password: 'StrongPassword123!',
      full_name: 'Captain Lifecycle',
      display_name: 'Lifecycle Trawler Co',
      dock_location: 'Visakhapatnam Jetty #5',
    });
    expect(newCap.success).toBe(true);
    const fishermanId = newCap.user!.id;
    expect(newCap.user?.status).toBe('pending');

    const sampleCatch = (name: string, price: number, qty: number): Omit<Product, 'id'> => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: 'Fresh seafood catch directly landed.',
      category_id: 'c1',
      category_name: 'Sea Fish',
      category_slug: 'sea-fish',
      origin_source: 'Visakhapatnam Jetty #5',
      price_per_unit: price,
      unit: 'kg',
      freshness: 'fresh_catch',
      stock_quantity: qty,
      min_order_qty: 1,
      is_available: true,
      is_featured: false,
      is_bestseller: false,
      gross_weight_text: 'Gross: 1000g',
      net_yield_text: 'Net: 750g',
      estimated_prep_minutes: 15,
      storage_instructions: 'Keep chilled between 0-4°C',
      allergen_info: 'Contains Fish',
      image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
      variants: [{ id: 'v1', product_id: '', variant_name: '1kg Whole', weight_grams: 1000, price, stock_quantity: qty }],
      preparation_options: [],
    });

    // 2. Pending fisherman attempts to add catch -> MUST FAIL
    const blockedCatch = await dbService.createProduct(
      sampleCatch('Pending Red Snapper', 450, 10),
      fishermanId
    );
    expect(blockedCatch.success).toBe(false);
    expect(blockedCatch.message).toContain('Only approved fishermen can sell products');

    // 3. Admin approves fisherman
    const approved = await dbService.updateFishermanStatus(fishermanId, 'approved');
    expect(approved?.status).toBe('approved');

    // 4. Approved fisherman adds catch -> MUST SUCCEED
    const successCatch = await dbService.createProduct(
      sampleCatch('Approved Deep Sea Pomfret', 850, 20),
      fishermanId
    );
    expect(successCatch.success).toBe(true);
    expect(successCatch.product).toBeDefined();
    expect(successCatch.product?.fisherman_id).toBe(fishermanId);
    expect(successCatch.product?.seller_name).toBe('Lifecycle Trawler Co');

    // 5. Product appears in products list and can be retrieved by fishermanId
    const catches = await dbService.getProducts({ fishermanId });
    expect(catches.find((p) => p.id === successCatch.product?.id)).toBeDefined();

    // 6. Admin suspends fisherman
    await dbService.updateFishermanStatus(fishermanId, 'suspended');

    // 7. Suspended fisherman cannot add catch -> MUST FAIL
    const suspendedCatch = await dbService.createProduct(
      sampleCatch('Suspended Catch Attempt', 300, 5),
      fishermanId
    );
    expect(suspendedCatch.success).toBe(false);
    expect(suspendedCatch.message).toContain('Only approved fishermen can sell products');
  });

  // --- Product Ownership & Listing Governance ---
  it('enforces product ownership: Fisherman A cannot edit Fisherman B products', async () => {
    const products = await dbService.getProducts();
    const captainRamanaProduct = products.find((p) => p.fisherman_id === 'u4');
    expect(captainRamanaProduct).toBeDefined();

    if (captainRamanaProduct) {
      // Fisherman A (u4) updating own product -> ALLOWED
      const updateOwn = await dbService.updateProduct(
        captainRamanaProduct.id,
        { stock_quantity: 15 },
        'u4',
        'fisherman'
      );
      expect(updateOwn.success).toBe(true);

      // Fisherman B (u5) trying to edit Fisherman A's product -> BLOCKED
      const updateOther = await dbService.updateProduct(
        captainRamanaProduct.id,
        { stock_quantity: 0 },
        'u5',
        'fisherman'
      );
      expect(updateOther.success).toBe(false);
      expect(updateOther.message).toContain('Unauthorized');

      // Fisherman B (u5) trying to delete Fisherman A's product -> BLOCKED
      const deleteOther = await dbService.deleteProduct(
        captainRamanaProduct.id,
        'u5',
        'fisherman'
      );
      expect(deleteOther.success).toBe(false);
      expect(deleteOther.message).toContain('Unauthorized');
    }
  });

  // --- Single-Fisherman Checkout & Stock Protection ---
  it('enforces single-fisherman rule at checkout', async () => {
    const products = await dbService.getProducts();
    const prodFromSeller1 = products.find((p) => p.fisherman_id === 'u4');
    const prodFromSeller2 = products.find((p) => p.fisherman_id === 'u5');

    expect(prodFromSeller1).toBeDefined();
    expect(prodFromSeller2).toBeDefined();

    const dummyAddress = {
      id: 'addr_test',
      user_id: 'u1',
      label: 'Home' as const,
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

    const dummySlot = {
      id: 'slot1',
      name: 'Early Morning',
      start_time: '06:30',
      end_time: '09:30',
      is_active: true,
    };

    // Attempt mixed-seller order in single checkout
    const mixedOrderResult = await dbService.createOrder({
      user_id: 'u1',
      customer_name: 'Test Customer',
      customer_phone: '+91 99999 99999',
      customer_email: 'test@example.com',
      status: 'confirmed',
      subtotal: 1000,
      cleaning_fee_total: 0,
      delivery_fee: 0,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: 1000,
      delivery_address: dummyAddress,
      delivery_slot: dummySlot,
      payment_method: 'cod',
      payment_status: 'pending',
      items: [
        {
          product_id: prodFromSeller1!.id,
          product_name: prodFromSeller1!.name,
          product_image: prodFromSeller1!.image_url,
          unit_price: prodFromSeller1!.price_per_unit,
          cleaning_fee: 0,
          quantity: 1,
          item_total: prodFromSeller1!.price_per_unit,
        },
        {
          product_id: prodFromSeller2!.id,
          product_name: prodFromSeller2!.name,
          product_image: prodFromSeller2!.image_url,
          unit_price: prodFromSeller2!.price_per_unit,
          cleaning_fee: 0,
          quantity: 1,
          item_total: prodFromSeller2!.price_per_unit,
        },
      ],
    });

    expect(mixedOrderResult.success).toBe(false);
    expect(mixedOrderResult.message).toContain('Single-Fisherman Rule');
  });

  // --- Order Lifecycle, COD Collection & Status Transitions ---
  it('deducts inventory on valid single-seller COD order and allows authorized COD collection', async () => {
    const products = await dbService.getProducts();
    const targetProduct = products.find((p) => p.stock_quantity >= 5 && p.fisherman_id === 'u4');
    expect(targetProduct).toBeDefined();

    const initialStock = targetProduct!.stock_quantity;

    const dummyAddress = {
      id: 'addr_test',
      user_id: 'u1',
      label: 'Home' as const,
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

    const dummySlot = {
      id: 'slot1',
      name: 'Early Morning',
      start_time: '06:30',
      end_time: '09:30',
      is_active: true,
    };

    const orderRes = await dbService.createOrder({
      user_id: 'u1',
      customer_name: 'Test Customer',
      customer_phone: '+91 99999 99999',
      customer_email: 'test@example.com',
      fisherman_id: targetProduct!.fisherman_id,
      seller_name: targetProduct!.seller_name,
      status: 'confirmed',
      subtotal: targetProduct!.price_per_unit * 2,
      cleaning_fee_total: 0,
      delivery_fee: 0,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: targetProduct!.price_per_unit * 2,
      delivery_address: dummyAddress,
      delivery_slot: dummySlot,
      payment_method: 'cod',
      payment_status: 'pending',
      items: [
        {
          product_id: targetProduct!.id,
          product_name: targetProduct!.name,
          product_image: targetProduct!.image_url,
          unit_price: targetProduct!.price_per_unit,
          cleaning_fee: 0,
          quantity: 2,
          item_total: targetProduct!.price_per_unit * 2,
        },
      ],
    });

    expect(orderRes.success).toBe(true);
    const newOrder = orderRes.order!;
    expect(newOrder.id).toBeDefined();
    expect(newOrder.order_number).toMatch(/^FB-\d+-\d+$/);
    expect(newOrder.payment_method).toBe('cod');
    expect(newOrder.payment_status).toBe('pending');

    // Verify stock deducted
    const updatedProd = await dbService.getProductById(targetProduct!.id);
    expect(updatedProd?.stock_quantity).toBe(initialStock - 2);

    // Fisherman updates preparation statuses
    const prepRes = await dbService.updateOrderStatus(
      newOrder.id,
      'accepted_for_prep',
      'Fresh catch taken to cleaning bay',
      'u4',
      'fisherman'
    );
    expect(prepRes.success).toBe(true);

    const readyRes = await dbService.updateOrderStatus(
      newOrder.id,
      'ready_for_pickup',
      'Packed with ice gel bags',
      'u4',
      'fisherman'
    );
    expect(readyRes.success).toBe(true);

    // Fisherman cannot mark delivered (only delivery partner / admin can)
    const unauthorizedDelivery = await dbService.updateOrderStatus(
      newOrder.id,
      'delivered',
      '',
      'u4',
      'fisherman'
    );
    expect(unauthorizedDelivery.success).toBe(false);

    // Delivery Partner or Admin records COD payment collection
    const codRes = await dbService.markCodPaymentCollected(newOrder.id, 'u3', 'Cash collected');
    expect(codRes.success).toBe(true);
    expect(codRes.order?.payment_status).toBe('success');
    expect(codRes.order?.payment_collected_at).toBeDefined();

    // Assign delivery partner
    await dbService.assignDeliveryPartner(newOrder.id, 'u3');

    // Rule test: Cannot jump directly from Ready for Pickup to Delivered
    const invalidDirectDelivery = await dbService.updateOrderStatus(newOrder.id, 'delivered');
    expect(invalidDirectDelivery.success).toBe(false);
    expect(invalidDirectDelivery.message).toContain('Out for Delivery');

    // Admin / Fleet marks Out for Delivery
    const outForDeliveryRes = await dbService.updateOrderStatus(newOrder.id, 'out_for_delivery');
    expect(outForDeliveryRes.success).toBe(true);
    expect(outForDeliveryRes.order?.status).toBe('out_for_delivery');

    // Delivery Partner marks delivered
    const deliveredRes = await dbService.updateOrderStatus(
      newOrder.id,
      'delivered',
      'Handed over chilled box to recipient',
      'u3',
      'delivery_partner'
    );
    expect(deliveredRes.success).toBe(true);
    expect(deliveredRes.order?.status).toBe('delivered');

    // Rule test: Delivered order cannot revert back to preparing
    const invalidRevert = await dbService.updateOrderStatus(newOrder.id, 'preparing');
    expect(invalidRevert.success).toBe(false);
  });

  // --- Verified Purchase Product Reviews ---
  it('enforces verified-buyer reviews: customers can only review delivered products', async () => {
    // 1. Trying to review an unpurchased product (p6) -> REJECTED
    const unpurchasedEligibility = await dbService.canUserReviewProduct('u1', 'p6');
    expect(unpurchasedEligibility.canReview).toBe(false);
    expect(unpurchasedEligibility.reason).toContain('Only verified buyers');

    // 2. Reviewing a product with completed delivery (p13)
    const reviewResult = await dbService.addVerifiedReview({
      product_id: 'p13',
      user_id: 'u1',
      author_name: 'Suresh Kumar',
      rating: 5,
      title: 'Crisp fresh catch',
      comment: 'Delicious curry cut, single bone, extremely fresh.',
    });
    expect(reviewResult.success).toBe(true);
    expect(reviewResult.review?.is_verified_buyer).toBe(true);

    // 3. Duplicate review attempt for same product -> REJECTED
    const duplicateReview = await dbService.addVerifiedReview({
      product_id: 'p13',
      user_id: 'u1',
      author_name: 'Suresh Kumar',
      rating: 4,
      title: 'Second review attempt',
      comment: 'Another comment.',
    });
    expect(duplicateReview.success).toBe(false);
    expect(duplicateReview.message).toContain('already reviewed');
  });

  // --- Customer Management & Directory Retrieval ---
  it('retrieves all registered customers from database including those with zero orders', async () => {
    const customers = await dbService.getCustomers();
    expect(customers.length).toBeGreaterThanOrEqual(4);

    // Verify all returned records are customers
    expect(customers.every((c) => c.role === 'customer')).toBe(true);

    // Verify registered customer with 0 orders (u9: Priya Sharma) is retrieved
    const zeroOrderCustomer = customers.find((c) => c.id === 'u9');
    expect(zeroOrderCustomer).toBeDefined();
    expect(zeroOrderCustomer?.full_name).toBe('Priya Sharma');
    expect(zeroOrderCustomer?.order_count).toBe(0);
    expect(zeroOrderCustomer?.total_spend).toBe(0);
    expect(zeroOrderCustomer?.recent_orders).toHaveLength(0);

    // Verify search works by name and email
    const searchByName = await dbService.getCustomers('Anitha');
    expect(searchByName.some((c) => c.full_name.includes('Anitha'))).toBe(true);

    const searchByEmail = await dbService.getCustomers('venkat@');
    expect(searchByEmail.some((c) => c.email.includes('venkat'))).toBe(true);

    // Verify missing phone numbers do not break retrieval
    const noPhoneCustomer = customers.find((c) => !c.phone || c.phone === '');
    if (noPhoneCustomer) {
      expect(noPhoneCustomer.id).toBeDefined();
    }
  });

  // --- Suresh Kumar Record Audit & Preservation ---
  it('preserves Suresh Kumar (u1) customer account, historical orders, and reviews', async () => {
    // 1. Customer account exists in database
    const customers = await dbService.getCustomers();
    const suresh = customers.find((c) => c.id === 'u1');
    expect(suresh).toBeDefined();
    expect(suresh?.full_name).toBe('Suresh Kumar');
    expect(suresh?.email).toBe('customer@fishbasket.in');
    expect(suresh?.phone).toBe('+91 98765 43210');
    expect(suresh?.order_count).toBeGreaterThanOrEqual(2);

    // 2. Historical orders exist and link to u1
    const order1 = await dbService.getOrderById('ord-1001');
    expect(order1).toBeDefined();
    expect(order1?.user_id).toBe('u1');
    expect(order1?.customer_name).toBe('Suresh Kumar');

    const order2 = await dbService.getOrderById('ord-1002');
    expect(order2).toBeDefined();
    expect(order2?.user_id).toBe('u1');
    expect(order2?.customer_name).toBe('Suresh Kumar');

    // 3. User u1 order history is retrieved accurately
    const sureshOrders = await dbService.getOrders('u1');
    expect(sureshOrders.length).toBeGreaterThanOrEqual(2);
    expect(sureshOrders.every((o) => o.user_id === 'u1')).toBe(true);
  });

  // --- Fisherman Order Pipeline & Order Visibility Isolation ---
  it('restricts fisherman order visibility to own catches and allows preparing -> ready_for_pickup only', async () => {
    // Fisherman u4: Captain Appa Rao (seller: Visakha Harbor Cooperative)
    const fishermanOrders = await dbService.getOrders(undefined, 'u4');
    expect(fishermanOrders.length).toBeGreaterThan(0);
    // Every order returned contains products from u4
    expect(
      fishermanOrders.every(
        (o) => o.fisherman_id === 'u4' || o.items.some((it) => it.fisherman_id === 'u4')
      )
    ).toBe(true);

    const prods = await dbService.getProducts();
    const target = prods.find((p) => p.fisherman_id === 'u4') || prods[0];

    // Create an order for fisherman u4
    const orderRes = await dbService.createOrder({
      user_id: 'u7',
      customer_name: 'Anitha Reddy',
      customer_email: 'anitha.reddy@gmail.com',
      customer_phone: '+91 94401 22334',
      status: 'confirmed',
      fisherman_id: target.fisherman_id || 'u4',
      seller_name: target.seller_name || 'Visakha Harbor Cooperative',
      subtotal: target.price_per_unit,
      cleaning_fee_total: 0,
      delivery_fee: 49,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: target.price_per_unit + 49,
      delivery_address: {
        id: 'addr_test',
        user_id: 'u7',
        label: 'Home',
        recipient_name: 'Anitha Reddy',
        phone: '+91 94401 22334',
        house_flat: 'Flat 402',
        street_locality: 'Lawson Bay Colony',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pincode: '530017',
        is_default: true,
        created_at: new Date().toISOString(),
      },
      delivery_slot: {
        id: 'slot_1',
        name: 'Morning Slot (8 AM - 11 AM)',
        start_time: '08:00',
        end_time: '11:00',
        is_active: true,
      },
      items: [
        {
          product_id: target.id,
          product_name: target.name,
          product_image: target.image_url,
          cleaning_fee: 0,
          unit_price: target.price_per_unit,
          quantity: 1,
          item_total: target.price_per_unit,
          fisherman_id: target.fisherman_id || 'u4',
        },
      ],
      payment_method: 'cod',
      payment_status: 'pending',
    });
    expect(orderRes.success).toBe(true);
    const testOrd = orderRes.order!;

    // 1. Fisherman u4 transitions confirmed -> preparing: SUCCESS
    const prepRes = await dbService.updateOrderStatus(
      testOrd.id,
      'preparing',
      'Cutting curry pieces',
      'u4',
      'fisherman'
    );
    expect(prepRes.success).toBe(true);
    expect(prepRes.order?.status).toBe('preparing');

    // 2. Fisherman u4 transitions preparing -> ready_for_pickup: SUCCESS
    const readyRes = await dbService.updateOrderStatus(
      testOrd.id,
      'ready_for_pickup',
      'Packed with ice gel',
      'u4',
      'fisherman'
    );
    expect(readyRes.success).toBe(true);
    expect(readyRes.order?.status).toBe('ready_for_pickup');

    // 3. Fisherman u4 attempts to mark delivered: REJECTED
    const deliveredAttempt = await dbService.updateOrderStatus(
      testOrd.id,
      'delivered',
      'Self delivery attempt',
      'u4',
      'fisherman'
    );
    expect(deliveredAttempt.success).toBe(false);

    // 4. Fisherman u4 attempts to mark out_for_delivery: REJECTED
    const dispatchAttempt = await dbService.updateOrderStatus(
      testOrd.id,
      'out_for_delivery',
      'Dispatch attempt',
      'u4',
      'fisherman'
    );
    expect(dispatchAttempt.success).toBe(false);

    // 5. Another fisherman attempts to modify u4's order: REJECTED
    const otherFishermanAttempt = await dbService.updateOrderStatus(
      testOrd.id,
      'preparing',
      'Unauthorized fisherman',
      'f_another',
      'fisherman'
    );
    expect(otherFishermanAttempt.success).toBe(false);
  });

  // --- Delivery Partner Restrictions & Workflow ---
  it('enforces delivery partner assignment and out_for_delivery -> delivered transition only', async () => {
    const prods = await dbService.getProducts();
    const target = prods.find((p) => p.fisherman_id === 'u4') || prods[0];

    const orderRes = await dbService.createOrder({
      user_id: 'u8',
      customer_name: 'K. Venkat Rao',
      customer_email: 'k.venkat.rao@yahoo.com',
      customer_phone: '+91 98850 33445',
      status: 'confirmed',
      fisherman_id: target.fisherman_id || 'u4',
      seller_name: target.seller_name || 'Visakha Harbor Cooperative',
      subtotal: target.price_per_unit,
      cleaning_fee_total: 0,
      delivery_fee: 49,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: target.price_per_unit + 49,
      delivery_address: {
        id: 'addr_test2',
        user_id: 'u8',
        label: 'Home',
        recipient_name: 'K. Venkat Rao',
        phone: '+91 98850 33445',
        house_flat: 'Plot 12',
        street_locality: 'MVP Colony Sector 3',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pincode: '530017',
        is_default: true,
        created_at: new Date().toISOString(),
      },
      delivery_slot: {
        id: 'slot_1',
        name: 'Morning Slot',
        start_time: '08:00',
        end_time: '11:00',
        is_active: true,
      },
      items: [
        {
          product_id: target.id,
          product_name: target.name,
          product_image: target.image_url,
          cleaning_fee: 0,
          unit_price: target.price_per_unit,
          quantity: 1,
          item_total: target.price_per_unit,
          fisherman_id: target.fisherman_id || 'u4',
        },
      ],
      payment_method: 'cod',
      payment_status: 'pending',
    });
    expect(orderRes.success).toBe(true);
    const dOrder = orderRes.order!;

    // Assign to delivery partner u3
    await dbService.assignDeliveryPartner(dOrder.id, 'u3');

    // 1. Delivery partner u3 cannot mark delivered while order is still confirmed: REJECTED
    const prematureDelivered = await dbService.updateOrderStatus(
      dOrder.id,
      'delivered',
      'Premature delivery',
      'u3',
      'delivery_partner'
    );
    expect(prematureDelivered.success).toBe(false);
    expect(prematureDelivered.message).toContain('Out for Delivery');

    // Advance order to preparing -> ready_for_pickup -> out_for_delivery
    await dbService.updateOrderStatus(dOrder.id, 'preparing', '', 'u4', 'fisherman');
    await dbService.updateOrderStatus(dOrder.id, 'ready_for_pickup', '', 'u4', 'fisherman');
    await dbService.updateOrderStatus(dOrder.id, 'out_for_delivery');

    // 2. Unassigned delivery partner cannot mark delivered: REJECTED
    const unassignedAttempt = await dbService.updateOrderStatus(
      dOrder.id,
      'delivered',
      'Unassigned attempt',
      'u_other_driver',
      'delivery_partner'
    );
    expect(unassignedAttempt.success).toBe(false);

    // 3. Assigned delivery partner u3 marks delivered: SUCCESS
    const validDelivered = await dbService.updateOrderStatus(
      dOrder.id,
      'delivered',
      'Delivered to customer doorstep',
      'u3',
      'delivery_partner'
    );
    expect(validDelivered.success).toBe(true);
    expect(validDelivered.order?.status).toBe('delivered');
  });

  // --- Admin Order Oversight & Transition Integrity Rules ---
  it('prevents invalid transitions across the order lifecycle', async () => {
    const prods = await dbService.getProducts();
    const target = prods.find((p) => p.fisherman_id === 'u4') || prods[0];

    const orderRes = await dbService.createOrder({
      user_id: 'u7',
      customer_name: 'Anitha Reddy',
      customer_email: 'anitha.reddy@gmail.com',
      customer_phone: '+91 94401 22334',
      status: 'confirmed',
      fisherman_id: target.fisherman_id || 'u4',
      seller_name: target.seller_name || 'Visakha Harbor Cooperative',
      subtotal: target.price_per_unit,
      cleaning_fee_total: 0,
      delivery_fee: 49,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: target.price_per_unit + 49,
      delivery_address: {
        id: 'addr_test3',
        user_id: 'u7',
        label: 'Home',
        recipient_name: 'Anitha Reddy',
        phone: '+91 94401 22334',
        house_flat: 'Flat 101',
        street_locality: 'Beach Road',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pincode: '530002',
        is_default: true,
        created_at: new Date().toISOString(),
      },
      delivery_slot: {
        id: 'slot_1',
        name: 'Morning Slot',
        start_time: '08:00',
        end_time: '11:00',
        is_active: true,
      },
      items: [
        {
          product_id: target.id,
          product_name: target.name,
          product_image: target.image_url,
          cleaning_fee: 0,
          unit_price: target.price_per_unit,
          quantity: 1,
          item_total: target.price_per_unit,
          fisherman_id: target.fisherman_id || 'u4',
        },
      ],
      payment_method: 'cod',
      payment_status: 'pending',
    });
    expect(orderRes.success).toBe(true);
    const invOrder = orderRes.order!;

    // Rule A: Placed / Confirmed -> Delivered without preparation: REJECTED
    const jumpToDelivered = await dbService.updateOrderStatus(invOrder.id, 'delivered');
    expect(jumpToDelivered.success).toBe(false);

    // Advance to preparing -> ready_for_pickup
    await dbService.updateOrderStatus(invOrder.id, 'preparing', '', 'u4', 'fisherman');
    await dbService.updateOrderStatus(invOrder.id, 'ready_for_pickup', '', 'u4', 'fisherman');

    // Rule B: Ready for Pickup -> Delivered without Out for Delivery: REJECTED
    const skipDispatch = await dbService.updateOrderStatus(invOrder.id, 'delivered');
    expect(skipDispatch.success).toBe(false);

    // Complete delivery legitimately
    await dbService.assignDeliveryPartner(invOrder.id, 'u3');
    await dbService.updateOrderStatus(invOrder.id, 'out_for_delivery');
    const validDel = await dbService.updateOrderStatus(invOrder.id, 'delivered', '', 'u3', 'delivery_partner');
    expect(validDel.success).toBe(true);

    // Rule C: Delivered -> Preparing backwards: REJECTED
    const revertToPrep = await dbService.updateOrderStatus(invOrder.id, 'preparing');
    expect(revertToPrep.success).toBe(false);

    // Rule E: Delivered -> Cancelled: REJECTED
    const cancelDelivered = await dbService.updateOrderStatus(invOrder.id, 'cancelled');
    expect(cancelDelivered.success).toBe(false);
  });

  // --- Delivery Partner Registration, Admin Approval, and Atomic Acceptance ---
  it('governs delivery partner lifecycle: registration, admin approval, available orders, and atomic claim', async () => {
    // 1. Register a new delivery partner
    const regRes = await dbService.registerDeliveryPartner({
      email: 'driver_ravi@fishbasket.in',
      full_name: 'Ravi Teja Fleet',
      phone: '+91 91234 56789',
      vehicle_info: 'Insulated Scooter (AP 31 AB 1234)',
      password: 'FishBasket@2026',
    });
    expect(regRes.success).toBe(true);
    expect(regRes.user?.role).toBe('delivery_partner');
    expect(regRes.user?.status).toBe('pending');
    expect(regRes.user?.vehicle_info).toBe('Insulated Scooter (AP 31 AB 1234)');
    const driverId = regRes.user!.id;

    // 2. Pending delivery partner cannot accept dispatches
    const testOrderRes = await dbService.createOrder({
      user_id: 'u1',
      customer_name: 'Suresh Kumar',
      customer_phone: '+91 98765 43210',
      customer_email: 'customer@fishbasket.in',
      fisherman_id: 'u4',
      seller_name: 'Captain Ramana (Bay Catch)',
      status: 'ready_for_pickup',
      subtotal: 500,
      cleaning_fee_total: 0,
      delivery_fee: 0,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: 500,
      delivery_address: {
        id: 'a1',
        user_id: 'u1',
        label: 'Home',
        recipient_name: 'Suresh Kumar',
        phone: '+91 98765 43210',
        house_flat: 'Flat 402',
        street_locality: 'Beach Road',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pincode: '530003',
        is_default: true,
        created_at: '2026-10-24T10:00:00Z',
      },
      delivery_slot: { id: 'slot1', name: 'Morning', start_time: '06:30', end_time: '09:30', is_active: true },
      items: [
        {
          product_id: 'p1',
          fisherman_id: 'u4',
          seller_name: 'Captain Ramana (Bay Catch)',
          product_name: 'Rohu Fish',
          product_image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
          cleaning_fee: 0,
          quantity: 2,
          unit_price: 250,
          item_total: 500,
        },
      ],
      payment_method: 'cod',
      payment_status: 'pending',
    });
    expect(testOrderRes.success).toBe(true);
    const orderToClaim = testOrderRes.order!;

    const pendingClaim = await dbService.claimDelivery(orderToClaim.id, driverId);
    expect(pendingClaim.success).toBe(false);
    expect(pendingClaim.message).toContain('pending');

    // 3. Admin approves the delivery partner
    const approvedPartner = await dbService.updateDeliveryPartnerStatus(driverId, 'approved');
    expect(approvedPartner?.status).toBe('approved');

    // 4. Verify getOrders with isAvailableForDelivery returns the unassigned ready_for_pickup order
    const availableOrders = await dbService.getOrders(undefined, undefined, undefined, {
      isAvailableForDelivery: true,
    });
    const foundAvailable = availableOrders.find((o) => o.id === orderToClaim.id);
    expect(foundAvailable).toBeDefined();

    // 5. Approved delivery partner accepts the order atomically
    const claimRes = await dbService.claimDelivery(orderToClaim.id, driverId);
    expect(claimRes.success).toBe(true);
    expect(claimRes.order?.assigned_delivery_partner?.id).toBe(driverId);

    // 6. Double claim prevention: Second delivery partner cannot claim already claimed delivery
    const doubleClaimRes = await dbService.claimDelivery(orderToClaim.id, 'u3');
    expect(doubleClaimRes.success).toBe(false);
    expect(doubleClaimRes.message).toContain('already been claimed');

    // 7. Order is no longer in available list
    const availableAfterClaim = await dbService.getOrders(undefined, undefined, undefined, {
      isAvailableForDelivery: true,
    });
    expect(availableAfterClaim.some((o) => o.id === orderToClaim.id)).toBe(false);

    // 8. Assigned delivery partner advances: ready_for_pickup -> out_for_delivery -> delivered
    const outRes = await dbService.updateOrderStatus(orderToClaim.id, 'out_for_delivery', '', driverId, 'delivery_partner');
    expect(outRes.success).toBe(true);
    expect(outRes.order?.status).toBe('out_for_delivery');

    const delivRes = await dbService.updateOrderStatus(orderToClaim.id, 'delivered', '', driverId, 'delivery_partner');
    expect(delivRes.success).toBe(true);
    expect(delivRes.order?.status).toBe('delivered');
  });
});
