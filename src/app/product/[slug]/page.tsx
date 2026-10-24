import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { dbService } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import ProductDetailClient from './ProductDetailClient';
import ProductReviewsSection from '@/components/ProductReviewsSection';
import {
  ShieldCheck,
  Truck,
  Sparkles,
  Scissors,
  Scale,
  Star,
  Info,
  ThermometerSnowflake,
  AlertTriangle,
} from 'lucide-react';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await dbService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (
    await dbService.getProducts({ categorySlug: product.category_slug })
  )
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const reviews = await dbService.getReviews(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-teal-600">Shop</Link>
        <span>/</span>
        <Link href={`/category/${product.category_slug}`} className="hover:text-teal-600">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Layout with Client Interaction (Variant & Prep selector, Add to Cart) */}
      <ProductDetailClient product={product} />

      {/* Trust & Handling Information */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-slate-200">
        <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
            <ThermometerSnowflake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Storage Instructions</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {product.storage_instructions}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Allergen Notice</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {product.allergen_info}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 bg-white p-5 rounded-2xl border border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">Delivery Information</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Delivered within selected 2-hour window in insulated gel-ice pack boxes. Inspect before cooking.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviewsSection productId={product.id} initialReviews={reviews} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200">
          <h3 className="text-xl font-black text-slate-900 mb-6">
            You May Also Like From {product.category_name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
