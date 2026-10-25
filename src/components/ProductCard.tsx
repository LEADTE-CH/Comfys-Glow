import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { formatNaira } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { resolveAssetUrl } from '../utils/assets.ts';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onPromptLogin?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onPromptLogin }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.sizeVariants && product.sizeVariants.length > 0 ? product.sizeVariants[0].size : undefined
  );

  const isFavorited = isInWishlist(product.id);

  // Determine effective price
  let currentPrice = product.price;
  if (selectedVariant && product.sizeVariants) {
    const v = product.sizeVariants.find((variant) => variant.size === selectedVariant);
    if (v) currentPrice = v.price;
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await toggleWishlist(product);
    if (!success && onPromptLogin) {
      onPromptLogin();
    }
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white border border-[#E8DCDE] rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer"
    >
      {/* Top Media Container (65% of visual focus) */}
      <div className="relative aspect-4/3 w-full bg-[#FAF5EE] overflow-hidden">
        <img
          src={resolveAssetUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />

        {/* Top Badges & Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {product.badge || product.advertisedSavings ? (
            <span className="pointer-events-auto text-[11px] font-semibold text-[#59172F] bg-[#FFF9F2]/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#C9A15B]/30 shadow-xs">
              {product.advertisedSavings ? `Save ${formatNaira(product.advertisedSavings)}` : product.badge}
            </span>
          ) : (
            <span />
          )}

          {/* Interactive Wishlist Heart Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all shadow-xs ${
              isFavorited
                ? 'bg-[#59172F] text-white'
                : 'bg-white/80 text-[#29232B] hover:bg-white hover:text-[#59172F]'
            }`}
            title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Quick stock warning if low */}
        {product.stock > 0 && product.stock <= 10 && (
          <div className="absolute bottom-2 left-2 text-[10px] font-medium text-amber-800 bg-amber-50/90 px-2 py-0.5 rounded border border-amber-200">
            Only {product.stock} left in stock
          </div>
        )}
      </div>

      {/* Card Content & Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata Line with typographic separators */}
          <div className="flex items-center gap-1.5 text-xs text-[#736B76] mb-1.5">
            <span className="uppercase tracking-wider font-medium text-[11px] text-[#C9A15B]">
              {product.category === 'soaps'
                ? 'Artisanal Soap'
                : product.category === 'perfumes'
                ? product.fragranceFamily || 'Fine Perfume'
                : product.category === 'combos'
                ? 'Value Combo'
                : 'Body Care'}
            </span>
            {product.rating > 0 && (
              <>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="flex items-center gap-1 font-medium text-[#29232B]">
                  <Star className="w-3 h-3 text-[#C9A15B] fill-current" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400">({product.reviewCount})</span>
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#29232B] group-hover:text-[#59172F] transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          {/* Short description / formula hint */}
          <p className="mt-1 text-xs text-[#5D5560] line-clamp-2 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Variant Selector pills if perfumes */}
          {product.sizeVariants && product.sizeVariants.length > 1 && (
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1" onClick={(e) => e.stopPropagation()}>
              {product.sizeVariants.map((v) => (
                <button
                  key={v.size}
                  type="button"
                  onClick={() => setSelectedVariant(v.size)}
                  className={`text-[11px] px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    selectedVariant === v.size
                      ? 'bg-[#59172F] text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {v.size.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-4 pt-3 border-t border-[#F0E6DE] flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-[#59172F] font-mono tabular-nums">
              {formatNaira(currentPrice)}
            </span>
            {product.originalPrice && product.originalPrice > currentPrice && (
              <span className="text-xs text-[#A098A2] line-through font-mono tabular-nums">
                {formatNaira(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all focus:outline-none ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] shadow-xs active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#C9A15B]" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
