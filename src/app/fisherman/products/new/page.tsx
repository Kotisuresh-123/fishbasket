'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Category, SeafoodFreshness } from '@/types';
import { formatINR } from '@/lib/cartUtils';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Fish,
  Scale,
  Sparkles,
  Camera,
  Layers,
} from 'lucide-react';

export default function NewFishermanProductPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Basic Details
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState('');
  const [varietySpecies, setVarietySpecies] = useState('');
  const [originSource, setOriginSource] = useState(user?.dock_location || 'Visakhapatnam Harbor');

  // Step 2: Price & Quantity
  const [pricePerUnit, setPricePerUnit] = useState<string>('350');
  const [unit, setUnit] = useState<'kg' | '500g' | 'piece' | 'pack'>('kg');
  const [stockQuantity, setStockQuantity] = useState<string>('25');
  const [minOrderQty, setMinOrderQty] = useState<string>('1');

  // Step 3: Photos & Preparation Options
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
  );
  const [freshness, setFreshness] = useState<SeafoodFreshness>('fresh_catch');
  const [prepOptions, setPrepOptions] = useState([
    {
      id: 'opt_1',
      name: 'Curry Cut',
      description: 'Cleaned, gutted, descaled into curry pieces',
      extra_price: 0,
      est_weight_loss_percent: 25,
      is_default: true,
    },
    {
      id: 'opt_2',
      name: 'Whole Cleaned',
      description: 'Descaled and gutted, head on',
      extra_price: 0,
      est_weight_loss_percent: 15,
      is_default: false,
    },
  ]);

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then(() => {
        // Fetch categories from database
        return fetch('/api/products?limit=1').catch(() => null);
      })
      .catch(() => {});

    // Load available categories
    setCategories([
      { id: 'c1000000-0000-0000-0000-000000000001', name: 'Freshwater Fish', slug: 'freshwater-fish', description: '', image_url: '', display_order: 1, is_active: true },
      { id: 'c1000000-0000-0000-0000-000000000002', name: 'Saltwater Fish', slug: 'saltwater-fish', description: '', image_url: '', display_order: 2, is_active: true },
      { id: 'c1000000-0000-0000-0000-000000000003', name: 'Prawns & Shrimp', slug: 'prawns', description: '', image_url: '', display_order: 3, is_active: true },
      { id: 'c1000000-0000-0000-0000-000000000004', name: 'Crabs & Shellfish', slug: 'crabs', description: '', image_url: '', display_order: 4, is_active: true },
      { id: 'c1000000-0000-0000-0000-000000000005', name: 'Squid & Calamari', slug: 'squid', description: '', image_url: '', display_order: 5, is_active: true },
    ]);
    setCategoryId('c1000000-0000-0000-0000-000000000002');
  }, []);

  // Step 1 Validation
  const validateStep1 = () => {
    if (!name.trim()) {
      setErrorMsg('Please enter the seafood catch name.');
      return false;
    }
    if (!categoryId) {
      setErrorMsg('Please select a category.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    const p = parseFloat(pricePerUnit);
    const s = parseFloat(stockQuantity);
    if (isNaN(p) || p <= 0) {
      setErrorMsg('Please enter a valid price per unit greater than 0.');
      return false;
    }
    if (isNaN(s) || s < 1) {
      setErrorMsg('Please enter an available quantity of at least 1.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    if (!imageUrl.trim()) {
      setErrorMsg('Please provide a photo URL for your catch.');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) setStep((s) => (s - 1) as any);
  };

  const handleAddPrep = () => {
    setPrepOptions([
      ...prepOptions,
      {
        id: 'opt_' + Date.now(),
        name: 'Custom Cut',
        description: 'Cleaned per customer preference',
        extra_price: 0,
        est_weight_loss_percent: 20,
        is_default: false,
      },
    ]);
  };

  const handleRemovePrep = (idx: number) => {
    setPrepOptions(prepOptions.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!user || user.role !== 'fisherman') {
      setErrorMsg('Authentication error: Please sign in as a fisherman.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const priceNum = parseFloat(pricePerUnit);
    const stockNum = parseFloat(stockQuantity);
    const minOrderNum = parseFloat(minOrderQty) || 1;

    const slug =
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now().toString().slice(-4);

    const payload = {
      category_id: categoryId,
      category_name: selectedCategory?.name || 'Seafood',
      category_slug: selectedCategory?.slug || 'saltwater-fish',
      name: name.trim(),
      slug,
      variety_species: varietySpecies.trim() || undefined,
      origin_source: originSource.trim() || user.dock_location || 'Visakhapatnam Harbor',
      description: description.trim() || `Fresh ${name.trim()} landed directly by ${user.display_name || user.full_name}.`,
      price_per_unit: priceNum,
      unit,
      stock_quantity: stockNum,
      min_order_qty: minOrderNum,
      freshness,
      image_url: imageUrl.trim(),
      gross_weight_text: `Gross: 1000g`,
      net_yield_text: `Net Cleaned: ~750g`,
      estimated_prep_minutes: 15,
      storage_instructions: 'Keep chilled below 4°C with ice gel pack. Cook fresh.',
      allergen_info: 'Contains fresh seafood.',
      fisherman_id: user.id,
      requesterId: user.id,
      requesterRole: user.role,
      variants: [
        {
          id: 'v_' + Date.now(),
          variant_name: `1 ${unit} Pack`,
          weight_grams: unit === 'kg' ? 1000 : 500,
          price: priceNum,
          stock_quantity: stockNum,
        },
      ],
      preparation_options: prepOptions.map((opt) => ({
        ...opt,
        product_id: '',
      })),
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Your catch has been published successfully!');
        setTimeout(() => {
          router.push('/fisherman/products');
        }, 1200);
      } else {
        // Server returned permission or validation error
        setErrorMsg(data.message || 'Failed to publish catch. Please check required fields.');
      }
    } catch {
      setErrorMsg('Network error while saving catch. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/fisherman/products"
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 mb-1 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Catches
          </Link>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Add Catch</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Publish your fresh seafood catch directly to the marketplace
          </p>
        </div>
        <div className="text-xs font-bold text-teal-700 dark:text-[#00D2C4] bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-500/20">
          Step {step} of 4
        </div>
      </div>

      {/* Clean 4-Step Progress Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { num: 1, title: 'Details' },
          { num: 2, title: 'Price & Stock' },
          { num: 3, title: 'Photo & Cuts' },
          { num: 4, title: 'Publish' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-2.5 rounded-xl text-center transition-all border ${
              step === s.num
                ? 'bg-[#00D2C4] text-[#112233] border-[#00D2C4] shadow-xs font-bold'
                : step > s.num
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 font-semibold'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]'
            }`}
          >
            <div className="text-[11px] font-bold">
              {step > s.num ? '✓ ' : ''}{s.num}. {s.title}
            </div>
          </div>
        ))}
      </div>

      {/* Error or Success Alert */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Main Step Cards */}
      <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-xs space-y-5">
        {/* STEP 1: Basic Details */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <Fish className="w-4 h-4 text-teal-600 dark:text-[#00D2C4]" />
              <span>Step 1: Catch & Category Details</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Catch / Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Fresh Silver Pomfret, White Prawns"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Seafood Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Species / Local Name (Optional)
                </label>
                <input
                  type="text"
                  value={varietySpecies}
                  onChange={(e) => setVarietySpecies(e.target.value)}
                  placeholder="e.g. Pampus argenteus / Chanduva"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Harbor Dock Landing Location
              </label>
              <input
                type="text"
                value={originSource}
                onChange={(e) => setOriginSource(e.target.value)}
                placeholder="e.g. Visakhapatnam Harbor Pier #3"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Catch Description (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe texture, size, recommended dishes (curry, fry, tandoor)..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Price & Quantity */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-600 dark:text-[#00D2C4]" />
              <span>Step 2: Pricing & Stock Inventory</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Price in Rupees (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={pricePerUnit}
                  onChange={(e) => setPricePerUnit(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Pricing Unit <span className="text-rose-500">*</span>
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                >
                  <option value="kg">Per Kilogram (kg)</option>
                  <option value="500g">Per 500 Grams (500g)</option>
                  <option value="piece">Per Piece</option>
                  <option value="pack">Per Box / Pack</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Available Quantity in Stock <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                />
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  When this reaches 0, the catch listing will automatically show as Sold Out.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                  Minimum Order Quantity
                </label>
                <input
                  type="number"
                  min={1}
                  value={minOrderQty}
                  onChange={(e) => setMinOrderQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Photos & Preparation Options */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-teal-600 dark:text-[#00D2C4]" />
              <span>Step 3: Catch Photo & Preparation Cuts</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
                Product Image URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#00D2C4] font-medium"
              />
            </div>

            {imageUrl && (
              <div className="flex items-center gap-3 p-3 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)]">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[var(--surface)] flex-shrink-0 border border-[var(--border)]">
                  <Image src={imageUrl} alt="Catch preview" fill className="object-cover" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-[var(--text-primary)] block">Photo Preview</span>
                  <span className="text-[11px] text-[var(--text-secondary)]">Displayed on storefront cards</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[var(--text-primary)]">
                  Supported Cleaning & Cut Options
                </label>
                <button
                  type="button"
                  onClick={handleAddPrep}
                  className="text-xs text-teal-600 dark:text-[#00D2C4] font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Cut Option
                </button>
              </div>

              <div className="space-y-2">
                {prepOptions.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-2 p-2.5 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] text-xs"
                  >
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => {
                        const updated = [...prepOptions];
                        updated[idx].name = e.target.value;
                        setPrepOptions(updated);
                      }}
                      placeholder="Cut Name (e.g. Curry Cut)"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePrep(idx)}
                      disabled={prepOptions.length <= 1}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 disabled:opacity-30"
                      title="Remove cut"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Review & Publish */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <h3 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border)] pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-[#00D2C4]" />
              <span>Step 4: Review Your Catch Details</span>
            </h3>

            {/* Clean Summary Card */}
            <div className="bg-[var(--surface-elevated)] rounded-2xl p-4 border border-[var(--border)] space-y-3 text-xs">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] flex-shrink-0">
                    <Image src={imageUrl} alt={name} fill className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{name}</h4>
                    <span className="text-teal-600 dark:text-[#00D2C4] font-semibold text-[11px]">
                      {selectedCategoryName}
                    </span>
                    {varietySpecies && (
                      <span className="text-[var(--text-secondary)] text-[11px] block italic">
                        {varietySpecies}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-[var(--text-primary)]">
                    {formatINR(parseFloat(pricePerUnit) || 0)}
                  </div>
                  <span className="text-[11px] text-[var(--text-secondary)] font-medium">per {unit}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-secondary)]">
                <div>
                  <strong className="text-[var(--text-primary)]">Stock:</strong> {stockQuantity} {unit}
                </div>
                <div>
                  <strong className="text-[var(--text-primary)]">Fisherman:</strong> {user?.display_name || user?.full_name}
                </div>
                <div>
                  <strong className="text-[var(--text-primary)]">Origin / Dock:</strong> {originSource}
                </div>
                <div>
                  <strong className="text-[var(--text-primary)]">Cuts:</strong> {prepOptions.map((p) => p.name).join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[var(--surface-elevated)] hover:bg-[var(--surface-elevated)]/80 text-[var(--text-primary)] border border-[var(--border)] font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-aqua px-5 py-2.5 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-aqua px-6 py-2.5 disabled:opacity-50 font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <span>Publishing Catch...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Fresh Catch</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
