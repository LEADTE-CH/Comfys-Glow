import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { formatNaira } from '../utils/formatters.ts';
import { resolveAssetUrl } from '../utils/assets.ts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products
        .filter((p) => !p.isDraft)
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.fragranceFamily?.toLowerCase().includes(query.toLowerCase()) ||
            p.ingredients?.toLowerCase().includes(query.toLowerCase())
        )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-[#FFF9F2] rounded-2xl shadow-2xl border border-[#C9A15B]/30 overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 bg-white border-b border-[#E8DCDE] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C9A15B]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search soaps, perfumes, body scrub, body butter, combos..."
            className="flex-1 bg-transparent text-sm sm:text-base text-[#29232B] placeholder-[#736B76] focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold text-[#59172F] hover:bg-[#E9DDF2] rounded-md transition-colors"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {query.trim() === '' ? (
            <div className="p-6 text-center text-xs text-[#736B76]">
              <p className="font-semibold text-slate-700 mb-2">Popular Searches</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Black Beauty Soap', 'Brightening Trio', 'Body Scrub', 'Royal Oud Velvet', 'Body Butter', 'Body Oil'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-3 py-1 bg-white border border-[#E8DCDE] hover:border-[#C9A15B] rounded-full text-xs text-[#59172F] transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#736B76]">
              No products found matching &ldquo;{query}&rdquo;. Try another keyword.
            </div>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  onSelectProduct(product);
                  onClose();
                }}
                className="p-3 bg-white hover:bg-[#FFF4E8] rounded-xl border border-[#E8DCDE] flex items-center justify-between gap-4 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={resolveAssetUrl(product.image)}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C9A15B]">
                      {product.category}
                    </span>
                    <h4 className="text-sm font-semibold text-[#29232B] group-hover:text-[#59172F] truncate">
                      {product.name}
                    </h4>
                    <p className="text-xs text-[#736B76] truncate">{product.shortDescription || product.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-[#59172F] font-mono tabular-nums">
                    {formatNaira(product.price)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#59172F] transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
