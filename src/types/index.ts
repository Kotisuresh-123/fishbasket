// ====================================================================
// FISH BASKET — CORE TYPE DEFINITIONS
// ====================================================================

export type UserRole = 'customer' | 'admin' | 'delivery_partner' | 'fisherman';

export type FishermanStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserProfile {
  id: string;
  auth_id?: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  status?: FishermanStatus;     // Applicable for fishermen & delivery partners: 'pending', 'approved', 'rejected', 'suspended'
  display_name?: string;       // Public brand/boat name for fishermen
  dock_location?: string;      // Fishing harbor / landing center
  vehicle_info?: string;       // Delivery fleet vehicle / bike description
  password_hash?: string;      // Salted hash for secure authentication
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: 'Home' | 'Work' | 'Other';
  recipient_name: string;
  phone: string;
  house_flat: string;
  street_locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  delivery_instructions?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export type SeafoodFreshness = 'fresh_catch' | 'chilled' | 'frozen';

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;      // e.g. "500g Pack", "1 kg Whole", "250g Trial"
  weight_grams: number;
  price: number;
  discount_price?: number;
  stock_quantity: number;
}

export interface PreparationOption {
  id: string;
  product_id: string;
  name: string;              // e.g. "Curry Cut", "Fry Cut", "Whole Cleaned", "Peeled & Deveined"
  description: string;
  extra_price: number;
  est_weight_loss_percent: number; // e.g. 25% removed in scales/guts
  is_default: boolean;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  name: string;
  slug: string;
  variety_species?: string;  // Scientific or regional name
  origin_source: string;     // Harbor or water body
  description: string;
  price_per_unit: number;    // Primary unit price
  unit: string;              // 'kg', '500g', 'pack', 'piece'
  discount_price?: number;
  freshness: SeafoodFreshness;
  stock_quantity: number;
  min_order_qty: number;
  is_available: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  gross_weight_text: string; // e.g. "Gross: 1000g"
  net_yield_text: string;    // e.g. "Net Cleaned: 700g - 750g"
  estimated_prep_minutes: number;
  storage_instructions: string;
  allergen_info: string;
  image_url: string;
  gallery_urls?: string[];
  variants: ProductVariant[];
  preparation_options: PreparationOption[];
  fisherman_id?: string;     // Profile ID of the fisherman seller
  seller_name?: string;       // Public display name of the fisherman seller
  rating?: number;
  review_count?: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  variant?: ProductVariant;
  preparation_option?: PreparationOption;
  quantity: number;
  custom_instructions?: string;
  unit_price: number;
  cleaning_fee: number;
  item_total: number;
}

export interface DeliveryZone {
  id: string;
  pincode: string;
  area_name: string;
  city: string;
  delivery_charge: number;
  min_order_for_free_delivery: number;
  is_serviceable: boolean;
  estimated_delivery_hours: number;
}

export interface DeliverySlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export type OrderStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'accepted_for_prep'
  | 'preparing'
  | 'ready_for_pickup'
  | 'handed_over'
  | 'packed'
  | 'ready_for_dispatch'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refund_initiated'
  | 'refunded';

export interface OrderItemSnapshot {
  product_id: string;
  product_name: string;
  product_slug?: string;
  product_image: string;
  variant_name?: string;
  weight_grams?: number;
  preparation_name?: string;
  cleaning_fee: number;
  unit_price: number;
  quantity: number;
  item_total: number;
  fisherman_id?: string;
  seller_name?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: OrderStatus;
  subtotal: number;
  cleaning_fee_total: number;
  delivery_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  coupon_code?: string;
  delivery_address: Address;
  delivery_slot: DeliverySlot;
  delivery_notes?: string;
  cancelled_reason?: string;
  fisherman_id?: string;      // Identifies the single fisherman supplying this order
  seller_name?: string;       // Display name of the fisherman supplying this order
  payment_method: 'razorpay' | 'cod';
  payment_status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_collected_at?: string;
  payment_collected_by?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  assigned_delivery_partner?: {
    id: string;
    name: string;
    phone: string;
  };
  items: OrderItemSnapshot[];
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  used_count: number;
}

export interface ProductReview {
  id: string;
  product_id: string;
  order_id?: string;          // Links review to verified qualifying completed purchase
  fisherman_id?: string;      // Links review to the fisherman seller
  user_id: string;
  author_name: string;
  rating: number;             // 1 to 5
  title: string;
  comment: string;
  is_verified_buyer: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface FishermanStats {
  totalOrders: number;
  activeListings: number;
  outOfStockListings: number;
  pendingPrep: number;
  readyForHandover: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface StoreSettings {
  store_name: string;
  tagline: string;
  support_phone: string;
  support_email: string;
  support_address: string;
  default_delivery_fee: number;
  free_delivery_threshold: number;
  tax_percentage: number;
  is_accepting_orders: boolean;
  operational_hours: string;
}

export interface CustomerOrderBrief {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: OrderStatus;
  items_summary: string;
}

export interface CustomerSummary {
  id: string;
  role?: UserRole;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  order_count: number;
  total_spend: number;
  last_order_date?: string;
  recent_orders?: CustomerOrderBrief[];
  orders: CustomerOrderBrief[];
}
