import React from 'react';
import { Sparkles, CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import type { Product } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { formatNaira } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { resolveAssetUrl } from '../utils/assets.ts';

interface BodyCareCombosPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onPromptLogin: () => void;
}

export const BodyCareCombosPage: React.FC<BodyCareCombosPageProps> = ({
  products,
  onSelectProduct,
  onPromptLogin,
}) => {
  const { addToCart } = useCart();

  const bodyCareProducts = products.filter((p) => p.category === 'body-care' && !p.isDraft);
  const comboSets = products.filter((p) => p.category === 'combos' && !p.isDraft);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
          Radiance & Value
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#59172F]">
          Body Care & Value Combos
        </h1>
        <p className="text-xs sm:text-sm text-[#5D5560] leading-relaxed">
          Nourish, exfoliate, and protect your skin with our signature body care essentials. Enjoy our curated combo sets engineered for complete daily glow with guaranteed value savings.
        </p>
      </div>

      {/* 2. VALUE COMBOS SECTION: MORE GLOW • MORE VALUE • MORE YOU */}
      <section className="bg-gradient-to-b from-[#FFF9F2] to-white p-6 sm:p-10 rounded-3xl border-2 border-[#C9A15B]/40 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#59172F]">
            <Sparkles className="w-4 h-4 text-[#C9A15B]" />
            <span>Curated Regimens</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
            More Glow • More Value • More You
          </h2>
          <p className="text-xs text-[#736B76]">
            Every combo set includes genuine advertised savings up to ₦1,200.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {comboSets.map((combo) => (
            <div
              key={combo.id}
              onClick={() => onSelectProduct(combo)}
              className="bg-white rounded-2xl border border-[#C9A15B]/30 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer group"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-[#FAF5EE]">
                <img
                  src={resolveAssetUrl(combo.image)}
                  alt={combo.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                {combo.advertisedSavings && (
                  <div className="absolute top-3 right-3 bg-[#59172F] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-[#C9A15B]">
                    Save {formatNaira(combo.advertisedSavings)}
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#29232B] group-hover:text-[#59172F] transition-colors">
                    {combo.name}
                  </h3>
                  <p className="text-xs text-[#736B76] mt-1 font-medium">
                    {combo.shortDescription}
                  </p>

                  {/* Component Breakdown */}
                  {combo.comboComponents && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#C9A15B] block mb-2">
                        Bundle Contents:
                      </span>
                      <ul className="space-y-1.5 text-xs text-[#4A434D]">
                        {combo.comboComponents.map((c, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{c.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#F0E6DE] flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold text-[#59172F] font-mono tabular-nums">
                      {formatNaira(combo.price)}
                    </div>
                    {combo.originalPrice && (
                      <div className="text-xs text-[#A098A2] line-through font-mono tabular-nums">
                        Individual Sum: {formatNaira(combo.originalPrice)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(combo, 1);
                    }}
                    className="px-4 py-2 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#C9A15B]" />
                    <span>Add Set</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INDIVIDUAL BODY CARE PRODUCTS */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A15B] mb-1">
            <span>Essential Formulation</span>
            <span aria-hidden="true">·</span>
            <span>Individual Essentials</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
            Individual Body Care Products
          </h2>
          <p className="text-xs text-[#736B76] mt-1">
            Each formula works harmoniously on its own or paired as part of our signature daily routine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {bodyCareProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onPromptLogin={onPromptLogin}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
