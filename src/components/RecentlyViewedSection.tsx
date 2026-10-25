import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useRecentlyViewed } from '../context/RecentlyViewedContext.tsx';
import type { Product } from '../types/index.ts';
import { ProductCard } from './ProductCard.tsx';

interface RecentlyViewedSectionProps {
  onSelectProduct: (product: Product) => void;
  currentProductId?: string; // exclude currently viewed item on PDP
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  onSelectProduct,
  currentProductId,
}) => {
  const { recentlyViewed } = useRecentlyViewed();

  const displayItems = recentlyViewed.filter((p) => p.id !== currentProductId).slice(0, 4);

  if (displayItems.length === 0) return null;

  return (
    <section className="py-12 border-t border-[#C9A15B]/20 bg-[#FFFDF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C9A15B]" />
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#59172F]">
              Recently Viewed Products
            </h3>
          </div>
          <span className="text-xs text-[#736B76]">Your browsing history</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {displayItems.map((product) => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>
      </div>
    </section>
  );
};
