'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Category } from '@/types';
import { INITIAL_CATEGORIES } from '@/data/mockData';
import { Layers, Plus, Edit2, Check } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: 'c_' + Date.now(),
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: desc.trim(),
      image_url: imageUrl,
      display_order: categories.length + 1,
      is_active: true,
    };

    setCategories([...categories, newCat]);
    setIsAddOpen(false);
    setName('');
    setDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Category Management</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Organize seafood categories, display order, and banner photography
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="btn-aqua px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {isAddOpen && (
        <form onSubmit={handleAddCategory} className="bg-[var(--surface)] p-6 rounded-2xl border border-teal-500/30 shadow-lg space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Create Seafood Category</h3>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm">✕</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Exotic Shellfish"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Banner Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[var(--text-primary)] mb-1">Short Description</label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Description of seafood in this category..."
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[#00D2C4]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-aqua px-5 py-2 font-bold rounded-xl text-xs"
            >
              Save Category
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="relative aspect-[16/9] w-full bg-[var(--surface-elevated)]">
              <Image src={c.image_url} alt={c.name} fill className="object-cover" />
              <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                Order: #{c.display_order}
              </div>
            </div>

            <div className="p-4 space-y-1">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">{c.name}</h3>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{c.description}</p>
              <div className="pt-2 text-[10px] text-teal-600 dark:text-[#00D2C4] font-mono font-semibold">
                /{c.slug}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
