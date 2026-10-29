-- -- ====================================================================
-- -- FISH BASKET — COMPREHENSIVE SEED DATA
-- -- Seed: supabase/seed.sql
-- -- Description: Authentic fresh seafood catalog, variants, options & settings
-- -- ====================================================================

-- -- 1. Store Settings
-- -- INSERT INTO store_settings (
-- --     store_name, tagline, support_phone, support_email, support_address, 
-- --     default_delivery_fee, free_delivery_threshold, tax_percentage, 
-- --     is_accepting_orders, operational_hours
-- -- ) VALUES (
-- --     'Fish Basket',
-- --     'Fresh Catch. Delivered Fresh.',
-- --     '+91 89190 23456',
-- --     'care@fishbasket.in',
-- --     'Harbor Terminal 3, Coastal Road, Visakhapatnam, AP 530001',
-- --     49.00,
-- --     499.00,
-- --     0.00,
-- --     TRUE,
-- --     '06:00 AM - 09:00 PM'
-- -- ) ON CONFLICT DO NOTHING;

-- -- 2. Demo Users & Profiles
-- -- Passwords in development can be standard demo tokens
-- INSERT INTO profiles (id, email, full_name, phone, role) VALUES
--     ('11111111-1111-1111-1111-111111111111', 'customer@fishbasket.in', 'Suresh Kumar', '+91 98765 43210', 'customer'),
--     ('22222222-2222-2222-2222-222222222222', 'admin@fishbasket.in', 'Admin Officer', '+91 98765 43211', 'admin'),
--     ('33333333-3333-3333-3333-333333333333', 'delivery@fishbasket.in', 'Ramesh Delivery', '+91 98765 43212', 'delivery_partner')
-- ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name;

-- -- 3. Default Delivery Addresses
-- INSERT INTO addresses (user_id, label, recipient_name, phone, house_flat, street_locality, landmark, city, state, pincode, is_default) VALUES
--     ('11111111-1111-1111-1111-111111111111', 'Home', 'Suresh Kumar', '+91 98765 43210', 'Flat 402, Sea Pearl Apts', 'Beach Road, Pandurangapuram', 'Near Submarine Museum', 'Visakhapatnam', 'Andhra Pradesh', '530003', TRUE),
--     ('11111111-1111-1111-1111-111111111111', 'Work', 'Suresh Kumar', '+91 98765 43210', 'Suite 5B, IT Tower', 'Rushikonda Tech Zone', 'Near Hill 2 Gate', 'Visakhapatnam', 'Andhra Pradesh', '530045', FALSE)
-- ON CONFLICT DO NOTHING;

-- -- 4. Delivery Zones & Pincodes
-- INSERT INTO delivery_zones (pincode, area_name, city, delivery_charge, min_order_for_free_delivery, is_serviceable, estimated_delivery_hours) VALUES
--     ('530001', 'One Town / Old Post Office', 'Visakhapatnam', 49.00, 499.00, TRUE, 2),
--     ('530002', 'Daba Gardens / Jagadamba', 'Visakhapatnam', 49.00, 499.00, TRUE, 2),
--     ('530003', 'Beach Road / Siripuram', 'Visakhapatnam', 49.00, 499.00, TRUE, 2),
--     ('530016', 'Dwaraka Nagar / RTC Complex', 'Visakhapatnam', 49.00, 499.00, TRUE, 2),
--     ('530017', 'MVP Colony / Sector 1 to 9', 'Visakhapatnam', 49.00, 499.00, TRUE, 2),
--     ('530026', 'Gajuwaka / Auto Nagar', 'Visakhapatnam', 59.00, 599.00, TRUE, 3),
--     ('530044', 'Sheela Nagar / BHPV', 'Visakhapatnam', 59.00, 599.00, TRUE, 3),
--     ('530045', 'Rushikonda / IT SEZ', 'Visakhapatnam', 69.00, 699.00, TRUE, 3),
--     ('530048', 'Madhurawada / PM Palem', 'Visakhapatnam', 59.00, 599.00, TRUE, 3)
-- ON CONFLICT (pincode) DO NOTHING;

-- -- 5. Delivery Slots
-- INSERT INTO delivery_slots (name, start_time, end_time, max_orders_per_slot, is_active) VALUES
--     ('Early Morning (06:30 AM - 09:30 AM)', '06:30:00', '09:30:00', 40, TRUE),
--     ('Mid-Morning (10:00 AM - 01:00 PM)', '10:00:00', '13:00:00', 50, TRUE),
--     ('Evening Fresh (04:30 PM - 07:30 PM)', '16:30:00', '19:30:00', 45, TRUE),
--     ('Dinner Special (07:30 PM - 09:30 PM)', '19:30:00', '21:30:00', 30, TRUE)
-- ON CONFLICT DO NOTHING;

-- -- 6. Categories
-- INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES
--     ('c1000000-0000-0000-0000-000000000001', 'Freshwater Fish', 'freshwater-fish', 'Naturally sweet-water river & lake catches sourced daily from Godavari and local sweet waters.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', 1, TRUE),
--     ('c1000000-0000-0000-0000-000000000002', 'Sea Fish', 'sea-fish', 'Fresh saltwater fish caught along the Bay of Bengal coastline and delivered chilled.', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80', 2, TRUE),
--     ('c1000000-0000-0000-0000-000000000003', 'Prawns & Shrimp', 'prawns', 'Succulent sea and coastal estuary prawns, available whole or peeled & deveined.', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80', 3, TRUE),
--     ('c1000000-0000-0000-0000-000000000004', 'Crabs', 'crabs', 'Live mangrove mud crabs and blue swimming sea crabs with rich, sweet meat.', 'https://images.unsplash.com/photo-1548811579-017cf2a4268b?auto=format&fit=crop&w=600&q=80', 4, TRUE),
--     ('c1000000-0000-0000-0000-000000000005', 'Lobster', 'lobster', 'Exquisite wild rock and sand lobsters for royal curries and butter-garlic grills.', 'https://images.unsplash.com/photo-1533044309907-0fa3413da946?auto=format&fit=crop&w=600&q=80', 5, TRUE),
--     ('c1000000-0000-0000-0000-000000000006', 'Squid & Cuttlefish', 'squid-cuttlefish', 'Tender calamari tubes and rings, cleaned with zero skin, ready for quick sautés and curries.', 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=600&q=80', 6, TRUE),
--     ('c1000000-0000-0000-0000-000000000007', 'Shellfish', 'shellfish', 'Fresh clams, black mussels, and coastal oysters thoroughly depurated for clean cooking.', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80', 7, TRUE),
--     ('c1000000-0000-0000-0000-000000000008', 'Seafood Combos', 'seafood-combos', 'Carefully curated weekend curry & fry combo packs combining favorite fish and fresh prawns.', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', 8, TRUE)
-- ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url;

-- -- 7. Seafood Products
-- INSERT INTO products (
--     id, category_id, name, slug, variety_species, origin_source, description,
--     price_per_unit, unit, discount_price, freshness, stock_quantity, min_order_qty,
--     is_available, is_featured, is_bestseller, gross_weight_text, net_yield_text,
--     estimated_prep_minutes
-- ) VALUES
--     -- 1. Rohu Fish
--     ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Rohu Fish (Bengali / Telugu Cut)', 'rohu-fish', 'Labeo rohita', 'Godavari Freshwaters',
--     'Freshwater favorite known for delicate texture, sweet flavor, and perfect absorption of spicy curry gravies and mustard bases.',
--     280.00, 'kg', 249.00, 'fresh_catch', 45.0, 1.0, TRUE, TRUE, TRUE, 'Gross: 1000g - 1200g', 'Net Cleaned: 700g - 750g', 15),

--     -- 2. Katla Fish
--     ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Katla Fish (River Carp)', 'katla-fish', 'Gibelion catla', 'Krishna Basin',
--     'Large river carp with juicy, thick steaks. Especially famous for flavorful head curries (Muri Ghanto) and rich weekend meals.',
--     320.00, 'kg', 289.00, 'fresh_catch', 35.0, 1.0, TRUE, FALSE, TRUE, 'Gross: 1500g', 'Net Cleaned: 1050g - 1100g', 15),

--     -- 3. Indian White Pomfret
--     ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Indian White Pomfret (Paplet / Vellai Vavval)', 'white-pomfret', 'Pampus argenteus', 'Bay of Bengal Deep Sea',
--     'The king of delicate seafood! Soft, silky white flesh with subtle buttery sweetness. Highly sought after for tawa fry, rechado, and steam.',
--     890.00, 'kg', 799.00, 'fresh_catch', 25.0, 0.5, TRUE, TRUE, TRUE, 'Gross: 500g (2-3 fish)', 'Net Cleaned: 400g - 420g', 10),

--     -- 4. Seer Fish / Surmai / Vanjaram
--     ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Seer Fish / Surmai (King Mackerel)', 'seer-fish-surmai', 'Scomberomorus commerson', 'Visakhapatnam Deep Harbor',
--     'Prized for its firm, single-bone meat and unforgettable rich taste. Cut into thick, round steaks perfect for pan-fried crispy rava fry or sour fish curry.',
--     980.00, 'kg', 899.00, 'fresh_catch', 30.0, 0.5, TRUE, TRUE, TRUE, 'Gross: 1000g', 'Net Cleaned: 800g (Steaks)', 15),

--     -- 5. Indian Mackerel (Bangda / Kanagurtulu)
--     ('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000002', 'Indian Mackerel (Bangda / Ayala)', 'indian-mackerel', 'Rastrelliger kanagurta', 'Coastal Andhra Waters',
--     'Rich in Omega-3 fatty acids and bold oceanic flavor. Firm dark flesh ideal for spicy tamarind pulusu and crispy shallow fry.',
--     290.00, 'kg', 249.00, 'fresh_catch', 50.0, 0.5, TRUE, FALSE, TRUE, 'Gross: 500g (4-6 fish)', 'Net Cleaned: 380g - 400g', 10),

--     -- 6. Sardines (Mathi / Kavallu)
--     ('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000002', 'Fresh Sardines (Mathi / Tarli)', 'sardines-mathi', 'Sardinella longiceps', 'Coromandel Coast',
--     'Small, super-flavorful oily fish loaded with calcium and heart-healthy nutrients. Best enjoyed shallow-fried with curry leaves and crushed black pepper.',
--     220.00, 'kg', 189.00, 'fresh_catch', 60.0, 0.5, TRUE, FALSE, FALSE, 'Gross: 500g (10-14 fish)', 'Net Cleaned: 350g', 12),

--     -- 7. Tiger Prawns
--     ('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000003', 'Jumbo Tiger Prawns (Fresh Catch)', 'tiger-prawns', 'Penaeus monodon', 'Pulicat Estuary & Sea',
--     'Distinct black stripes, crisp crunch, and naturally sweet meat. Fantastic for butter garlic toss, biryanis, and tandoori skewers.',
--     750.00, '500g', 680.00, 'fresh_catch', 40.0, 1.0, TRUE, TRUE, TRUE, 'Gross: 500g (10-15 pcs)', 'Net Peeled: 320g - 350g', 15),

--     -- 8. White Prawns
--     ('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000003', 'Medium White Prawns (Royyalu)', 'white-prawns', 'Fenneropenaeus indicus', 'Kakinada Coast',
--     'Tender, sweet, versatile medium prawns. Perfect for everyday home curries, coconut gravies, and prawn pepper fry.',
--     450.00, '500g', 399.00, 'fresh_catch', 50.0, 1.0, TRUE, FALSE, TRUE, 'Gross: 500g (25-35 pcs)', 'Net Peeled: 310g - 330g', 15),

--     -- 9. Live Mud Crab
--     ('d1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000004', 'Live Mangrove Mud Crab (Large)', 'mud-crab', 'Scylla serrata', 'Godavari Mangrove Creeks',
--     'Plump, sweet crab meat encased in hard claws. Unbeatable depth in pepper masala crab roast and traditional Andhra crab iguru.',
--     850.00, 'kg', 799.00, 'fresh_catch', 20.0, 1.0, TRUE, TRUE, FALSE, 'Gross: 1000g (2-3 crabs)', 'Net Cleaned: 600g - 650g', 20),

--     -- 10. Blue Swimming Crab
--     ('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000004', 'Blue Swimming Sea Crab', 'blue-swimming-crab', 'Portunus armatus', 'Bay of Bengal Deep Shelf',
--     'Sea crabs with tender, sweet body meat and delicate claws. Excellent for spicy broth-based curries that soak up every nuance of sweetness.',
--     550.00, 'kg', 480.00, 'fresh_catch', 25.0, 1.0, TRUE, FALSE, TRUE, 'Gross: 1000g (4-6 crabs)', 'Net Cleaned: 550g - 600g', 18),

--     -- 11. Squid (Calamari / Koonthal)
--     ('d1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000006', 'Fresh Calamari Squid Rings / Tubes', 'fresh-squid', 'Uroteuthis duvaucelii', 'Visakhapatnam Shoreline',
--     'Mild oceanic sweetness with pleasant chewy snap when cooked fast. Skin peeled and ink sack removed; pre-cut into ready-to-cook rings.',
--     480.00, '500g', 420.00, 'fresh_catch', 30.0, 1.0, TRUE, FALSE, FALSE, 'Gross: 700g', 'Net Cleaned: 500g (Rings)', 15),

--     -- 12. Cuttlefish
--     ('d1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000006', 'Whole Cleaned Cuttlefish (Kanava)', 'cuttlefish-cleaned', 'Sepia pharaonis', 'East Coast Deep Reefs',
--     'Thicker, fleshier mantle than squid with an intensely savory profile. Diamond-scored for rapid curry cooking and stir fry.',
--     490.00, '500g', 440.00, 'chilled', 20.0, 1.0, TRUE, FALSE, FALSE, 'Gross: 750g', 'Net Cleaned: 500g', 15),

--     -- 13. Weekend Seafood Combo
--     ('d1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000008', 'Family Weekend Feast (Rohu Cut + White Prawns)', 'family-weekend-combo', 'Combo Pack', 'Coastal Sourcing',
--     'The ultimate Sunday family meal pack! Includes 500g Bengali Curry Cut Rohu plus 350g Peeled White Prawns at a special combo discount.',
--     650.00, 'pack', 549.00, 'fresh_catch', 25.0, 1.0, TRUE, TRUE, TRUE, 'Gross: 1200g combined', 'Net: 850g Cleaned Ready to Cook', 15)
-- ON CONFLICT (slug) DO UPDATE SET price_per_unit = EXCLUDED.price_per_unit, discount_price = EXCLUDED.discount_price;

-- -- 8. Product Images
-- INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
--     ('d1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', 'Fresh Rohu Fish Curry Cut', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 'Katla River Carp Fresh Catch', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', 'Indian White Pomfret (Paplet)', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', 'Seer Fish Surmai Slices', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', 'Indian Mackerel Bangda', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80', 'Fresh Coastal Sardines', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80', 'Jumbo Tiger Prawns', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80', 'White Prawns Royyalu', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1548811579-017cf2a4268b?auto=format&fit=crop&w=800&q=80', 'Live Mangrove Mud Crab', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1548811579-017cf2a4268b?auto=format&fit=crop&w=800&q=80', 'Blue Swimming Sea Crab', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=800&q=80', 'Fresh Squid Rings Calamari', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1606851094655-b2593a9af63f?auto=format&fit=crop&w=800&q=80', 'Cleaned Cuttlefish Kanava', TRUE, 1),
--     ('d1000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 'Seafood Combo Weekend Pack', TRUE, 1)
-- ON CONFLICT DO NOTHING;

-- -- 9. Preparation & Cleaning Options
-- -- Fish options: Curry Cut, Fry Cut, Whole Cleaned, Whole Uncleaned
-- INSERT INTO product_preparation_options (product_id, name, description, extra_price, est_weight_loss_percent, is_default) VALUES
--     -- Rohu
--     ('d1000000-0000-0000-0000-000000000001', 'Curry Cut (Head + Steaks)', 'Gutted, descaled, washed, cut into pieces with head included. Perfect for rich gravies.', 0.00, 25.00, TRUE),
--     ('d1000000-0000-0000-0000-000000000001', 'Fry Cut (Thin Steaks, No Head)', 'Head removed, clean steaks cut thin for crispy frying.', 20.00, 32.00, FALSE),
--     ('d1000000-0000-0000-0000-000000000001', 'Whole Cleaned (Gutted & Descaled)', 'Whole fish with scales and viscera removed. Kept intact for whole baked dishes.', 0.00, 18.00, FALSE),
--     ('d1000000-0000-0000-0000-000000000001', 'Whole Uncleaned', 'Raw catch as harvested. Weight is 100% gross weight.', 0.00, 0.00, FALSE),

--     -- White Pomfret
--     ('d1000000-0000-0000-0000-000000000003', 'Whole Cleaned & Degutted with Slits', 'Gills and viscera gently removed, lateral diamond slits made for marination to seep in.', 0.00, 15.00, TRUE),
--     ('d1000000-0000-0000-0000-000000000003', 'Curry Cut (Steaks with Bone)', 'Gutted and cut into medium steaks suitable for mild coconut curry.', 0.00, 20.00, FALSE),
--     ('d1000000-0000-0000-0000-000000000003', 'Whole Uncleaned', 'Straight from the fishing trawler intact.', 0.00, 0.00, FALSE),

--     -- Seer Fish Surmai
--     ('d1000000-0000-0000-0000-000000000004', 'Fry Cut Steaks (Surmai Darne)', 'Clean round slices with center bone. Ideal for shallow rava fish fry.', 0.00, 18.00, TRUE),
--     ('d1000000-0000-0000-0000-000000000004', 'Curry Cut (Head & Tail Pieces Included)', 'Complete fish cut into curry pieces including head pieces for deep savory flavor.', 0.00, 20.00, FALSE),
--     ('d1000000-0000-0000-0000-000000000004', 'Boneless Cubes', 'Center bone removed, cut into boneless bite-sized cubes for kids and curries.', 40.00, 35.00, FALSE),

--     -- Tiger Prawns
--     ('d1000000-0000-0000-0000-000000000007', 'Peeled & Deveined (Tail On)', 'Shell, legs and digestive tract removed. Tail left on for presentation.', 20.00, 35.00, TRUE),
--     ('d1000000-0000-0000-0000-000000000007', 'Completely Peeled & Deveined', 'Shell, head, digestive vein and tail all completely removed. Ready to pan-fry.', 30.00, 42.00, FALSE),
--     ('d1000000-0000-0000-0000-000000000007', 'Whole with Shell (Unpeeled)', 'Intact whole prawns with shell and head for smoking and broth-making.', 0.00, 0.00, FALSE),

--     -- Mud Crab
--     ('d1000000-0000-0000-0000-000000000009', 'Cleaned & Halved (Claws Cracked)', 'Top shell removed, gills washed out, halved, claws cracked for easy sauce entry.', 30.00, 35.00, TRUE),
--     ('d1000000-0000-0000-0000-000000000009', 'Live Whole Tied', 'Live crabs securely tied with natural twine. Inspect upon delivery.', 0.00, 0.00, FALSE)
-- ON CONFLICT DO NOTHING;

-- -- 10. Coupons
-- INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active) VALUES
--     ('FRESH100', 'Get Flat ₹100 off on your fresh catch order above ₹699', 'fixed', 100.00, 699.00, 100.00, TRUE),
--     ('FISH50', 'Get Flat ₹50 off on fresh seafood orders above ₹399', 'fixed', 50.00, 399.00, 50.00, TRUE),
--     ('WELCOME20', 'Get 20% off up to ₹150 on your first fresh catch order', 'percentage', 20.00, 499.00, 150.00, TRUE)
-- ON CONFLICT (code) DO NOTHING;

-- -- 11. Customer Reviews
-- INSERT INTO reviews (product_id, user_id, rating, title, comment, is_verified_buyer, is_approved) VALUES
--     ('d1000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 5, 'Super fresh Rohu!', 'The fish was delivered chilled with gel ice packs. Absolutely clean curry cut with zero fishy odor. Cooked the same afternoon and taste was sweet and tender.', TRUE, TRUE),
--     ('d1000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 5, 'Top notch Surmai fry slices', 'The slices were uniform, firm and single-bone. Made spicy rava fry for Sunday lunch. Highly recommend Fish Basket!', TRUE, TRUE),
--     ('d1000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 5, 'Huge juicy prawns', 'Peeled and deveined properly. Saved 30 mins of prep time in the kitchen. Juicy texture when sauteed in garlic butter.', TRUE, TRUE)
-- ON CONFLICT DO NOTHING;
