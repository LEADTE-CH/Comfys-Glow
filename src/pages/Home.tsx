import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Leaf,
  Droplets,
  PackageCheck,
  CheckCircle2,
  Star,
  Quote,
  MessageCircle,
} from 'lucide-react';
import type { Product } from '../types/index.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { RecentlyViewedSection } from '../components/RecentlyViewedSection.tsx';
import { formatNaira, getWhatsAppInquiryLink } from '../utils/formatters.ts';
import { resolveAssetUrl } from '../utils/assets.ts';

interface HomeProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
  onPromptLogin: () => void;
}

export const Home: React.FC<HomeProps> = ({
  products,
  onSelectProduct,
  onNavigate,
  onPromptLogin,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Filter products
  const featuredProducts = products.filter((p) => p.isFeatured && !p.isDraft).slice(0, 4);
  const combos = products.filter((p) => p.category === 'combos' && !p.isDraft);
  const soapProducts = products.filter((p) => p.category === 'soaps' && !p.isDraft);
  const perfumeProducts = products.filter((p) => p.category === 'perfumes' && !p.isDraft).slice(0, 4);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSuccess(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSuccess(false), 4000);
    }
  };

  return (
    <div className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#FAF5EE] border-b border-[#C9A15B]/30 pt-6 sm:pt-8 pb-12 sm:pb-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left">
              {/* Unboxed Kicker */}
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#59172F] tracking-wider uppercase">
                <span className="w-5 sm:w-6 h-[1px] bg-[#C9A15B]" />
                <span className="text-[11px] sm:text-xs">Artisanal Beauty & Fine Fragrance</span>
                <span className="w-5 sm:w-6 h-[1px] bg-[#C9A15B]" />
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#59172F] leading-[1.15] sm:leading-[1.1] tracking-tight text-balance">
                Glow with Elegance.
              </h1>

              <p className="text-sm sm:text-lg text-[#4A434D] font-serif italic max-w-xl mx-auto lg:mx-0 leading-relaxed text-balance">
                &ldquo;We nourish and glow without bleaching. Brightening is about bringing out your skin’s natural radiance—caring for your beauty with organic purity.&rdquo;
              </p>

              <p className="text-xs sm:text-sm text-[#736B76] max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Handcrafted in Ado-Ekiti, Ekiti State. Discover our signature African black beauty soaps, nourishing turmeric & coffee body scrubs, rich whipped body butters, and enchanting perfumes.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-4">
                <button
                  onClick={() => onNavigate('soaps')}
                  className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group active:scale-95"
                >
                  <span>Explore Soaps</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A15B] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigate('perfumes')}
                  className="w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 bg-white border border-[#C9A15B] hover:bg-[#C9A15B] hover:text-white text-[#59172F] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95"
                >
                  Shop Perfumes
                </button>

                <button
                  onClick={() => onNavigate('body-care-combos')}
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3.5 text-xs font-semibold text-[#5B286F] hover:text-[#59172F] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-[#C9A15B]" />
                  <span>View Combo Sets</span>
                </button>
              </div>

              {/* Delivery Trust Note */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4 text-xs text-[#736B76]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Ekiti & Ondo State Doorstep Delivery</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No Online Card Payment Required</span>
                </div>
              </div>
            </div>

            {/* Right Media Focal Anchor */}
            <div className="lg:col-span-6 relative mt-4 lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#C9A15B]/40 aspect-16/10">
                <img
                  src={resolveAssetUrl('/src/assets/images/comfy_hero_collection_1791541604861.jpg')}
                  alt="Comfy's Glow Collection"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  fetchPriority="high"
                  decoding="async"
                />

                {/* Subtle Overlay Floating Label */}
                <div className="absolute bottom-2.5 sm:bottom-4 left-2.5 sm:left-4 right-2.5 sm:right-4 bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-xl border border-[#C9A15B]/30 flex items-center justify-between shadow-lg">
                  <div className="min-w-0 pr-2">
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-[#C9A15B] block truncate">
                      The Complete Regimen
                    </span>
                    <h4 className="font-serif text-xs sm:text-sm font-bold text-[#59172F] truncate">
                      Full Brightening Set
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-[#736B76] truncate hidden xs:block">
                      Soap + Scrub + Butter + Oil
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-[#59172F] font-mono tabular-nums block">
                      ₦15,000
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-200">
                      Save ₦1,200
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION STRIP (Full Width) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 p-4 sm:p-8 bg-white border border-[#E8DCDE] rounded-2xl shadow-xs">
          <div className="flex items-center sm:items-start gap-3 p-2 sm:p-0">
            <div className="w-10 h-10 rounded-xl bg-[#E9DDF2]/60 text-[#59172F] flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-[#59172F]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#29232B] uppercase tracking-wide">100% Non-Bleaching</h4>
              <p className="text-xs text-[#736B76] mt-0.5">Brightens natural complexion without harsh chemicals.</p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-3 p-2 sm:p-0">
            <div className="w-10 h-10 rounded-xl bg-[#E9DDF2]/60 text-[#59172F] flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5 text-[#59172F]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#29232B] uppercase tracking-wide">Aloe & Carrot Enriched</h4>
              <p className="text-xs text-[#736B76] mt-0.5">Natural botanical extracts for soothing deep hydration.</p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-3 p-2 sm:p-0">
            <div className="w-10 h-10 rounded-xl bg-[#E9DDF2]/60 text-[#59172F] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#59172F]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#29232B] uppercase tracking-wide">Local Reliable Transit</h4>
              <p className="text-xs text-[#736B76] mt-0.5">Prompt delivery across Ekiti State & Akure, Ondo State.</p>
            </div>
          </div>

          <div className="flex items-center sm:items-start gap-3 p-2 sm:p-0">
            <div className="w-10 h-10 rounded-xl bg-[#E9DDF2]/60 text-[#59172F] flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5 text-[#59172F]" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#29232B] uppercase tracking-wide">Wholesale & Bulk</h4>
              <p className="text-xs text-[#736B76] mt-0.5">Direct bulk orders available for all 5 soap varieties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BESTSELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A15B] mb-1">
              <span>Curated Selection</span>
              <span aria-hidden="true">·</span>
              <span>Bestsellers</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
              Customer Favorites
            </h2>
          </div>

          <button
            onClick={() => onNavigate('soaps')}
            className="text-xs font-bold text-[#59172F] hover:text-[#5B286F] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View Full Catalogue</span>
            <ArrowRight className="w-4 h-4 text-[#C9A15B]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onPromptLogin={onPromptLogin}
            />
          ))}
        </div>
      </section>

      {/* 4. COMBO SETS HIGHLIGHT: MORE GLOW • MORE VALUE • MORE YOU */}
      <section className="bg-[#FAF4EB] py-16 border-y border-[#C9A15B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
              Bundled Value Sets
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#59172F]">
              More Glow • More Value • More You
            </h2>
            <p className="text-xs sm:text-sm text-[#5D5560] leading-relaxed">
              Experience the synergistic power of our complete beauty routine. Bundled together to give you maximum skin radiance with genuine savings up to ₦1,200.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {combos.map((combo) => (
              <div
                key={combo.id}
                onClick={() => onSelectProduct(combo)}
                className="bg-white rounded-2xl border-2 border-[#C9A15B]/40 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer group"
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
                    <div className="absolute top-3 right-3 bg-[#59172F] text-[#FFF9F2] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-[#C9A15B]">
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

                    {/* Component list */}
                    {combo.comboComponents && (
                      <ul className="mt-4 space-y-1.5 text-xs text-[#4A434D]">
                        {combo.comboComponents.map((c, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A15B]" />
                            <span>{c.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#F0E6DE] flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold text-[#59172F] font-mono tabular-nums">
                        {formatNaira(combo.price)}
                      </div>
                      {combo.originalPrice && (
                        <div className="text-xs text-[#A098A2] line-through font-mono tabular-nums">
                          Value: {formatNaira(combo.originalPrice)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(combo);
                      }}
                      className="px-4 py-2 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      View Set
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SIGNATURE SOAPS SPOTLIGHT & BULK ORDERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-gradient-to-br from-[#59172F] to-[#36081A] rounded-3xl p-8 sm:p-12 text-[#FFF9F2] relative overflow-hidden shadow-xl border border-[#C9A15B]/30">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C9A15B]">
                Craftsmanship & Formula
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
                Our 5 Signature Soap Varieties
              </h2>
              <p className="text-xs sm:text-sm text-[#E9DDF2]/90 leading-relaxed max-w-xl">
                Comfy’s Glow formulates five tailored soap varieties to address distinct skin needs—from persistent acne and dark spots to deep cellular hydration and sensitive skin barrier repair.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('soaps')}
                  className="px-6 py-3 bg-[#C9A15B] hover:bg-[#b58c46] text-[#29232B] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  Explore Soap Bar
                </button>
                <a
                  href={getWhatsAppInquiryLink('Bulk Soap Orders')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-[#C9A15B]/50 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#C9A15B]" />
                  <span>Wholesale Inquiry</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C9A15B]">
                <Sparkles className="w-4 h-4" />
                <span>Featured Variety #1</span>
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Comfy’s Black Beauty Soap</h3>
              <p className="text-xs text-[#E9DDF2]/80 leading-relaxed">
                Our customer-proven remedy for acne, dark spots, and dull skin. Carrot root extract + pure Aloe vera gel in authentic African black soap.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-[#C9A15B] font-mono tabular-nums">₦4,200</span>
                <button
                  onClick={() => onNavigate('soaps')}
                  className="text-xs font-bold text-white underline hover:text-[#C9A15B] transition-colors"
                >
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PERFUMES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A15B] mb-1">
              <span>Fine Fragrance Boutique</span>
              <span aria-hidden="true">·</span>
              <span>Long-Lasting Sillage</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
              Luxury Perfumes & Scents
            </h2>
          </div>

          <button
            onClick={() => onNavigate('perfumes')}
            className="text-xs font-bold text-[#59172F] hover:text-[#5B286F] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View All Perfumes</span>
            <ArrowRight className="w-4 h-4 text-[#C9A15B]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {perfumeProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onPromptLogin={onPromptLogin}
            />
          ))}
        </div>
      </section>

      {/* 7. RECENTLY VIEWED PRODUCTS (AS REQUESTED) */}
      <RecentlyViewedSection onSelectProduct={onSelectProduct} />

      {/* 8. VERIFIED CUSTOMER REVIEWS */}
      <section id="reviews" className="bg-white py-16 border-t border-[#E8DCDE] scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A15B]">
              Real Glow Transformations
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#59172F]">
              What Our Customers Say
            </h2>
            <p className="text-xs text-[#736B76]">
              Genuine reviews from verified shoppers across Ekiti and Ondo State.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DCDE] space-y-3 relative">
              <Quote className="w-8 h-8 text-[#C9A15B]/30 absolute top-4 right-4" />
              <div className="flex text-[#C9A15B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#4A434D] leading-relaxed">
                &ldquo;I was hesitant because many soaps in Nigeria bleach your skin without you knowing. Comfy’s Black Beauty Soap cleared my acne naturally. My skin feels fresh, soft, and my natural complexion is glowing.&rdquo;
              </p>
              <div className="pt-2 border-t border-[#E8DCDE]/50">
                <h4 className="text-xs font-bold text-[#29232B]">Verified Customer</h4>
                <p className="text-[11px] text-[#736B76]">Verified Purchase</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DCDE] space-y-3 relative">
              <Quote className="w-8 h-8 text-[#C9A15B]/30 absolute top-4 right-4" />
              <div className="flex text-[#C9A15B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#4A434D] leading-relaxed">
                &ldquo;The whipped body butter and oil combination is out of this world. After a shower with the scrub, my skin stays moisturized all day. The order was confirmed and delivered promptly!&rdquo;
              </p>
              <div className="pt-2 border-t border-[#E8DCDE]/50">
                <h4 className="text-xs font-bold text-[#29232B]">Verified Customer</h4>
                <p className="text-[11px] text-[#736B76]">Verified Purchase</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF9F2] border border-[#E8DCDE] space-y-3 relative">
              <Quote className="w-8 h-8 text-[#C9A15B]/30 absolute top-4 right-4" />
              <div className="flex text-[#C9A15B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs text-[#4A434D] leading-relaxed">
                &ldquo;Ordered Royal Oud Velvet perfume alongside the Full Brightening Set. The fragrance longevity is superb—people stop me everywhere to ask what I have on. Premium packaging and authentic quality!&rdquo;
              </p>
              <div className="pt-2 border-t border-[#E8DCDE]/50">
                <h4 className="text-xs font-bold text-[#29232B]">Verified Customer</h4>
                <p className="text-[11px] text-[#736B76]">Verified Purchase</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER SUBSCRIPTION */}
      <section className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF5EE] border border-[#C9A15B]/30 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A15B]">
            Exclusive Glow Updates
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
            Receive Self-Care Rituals & Private Offerings
          </h3>
          <p className="text-xs sm:text-sm text-[#736B76] max-w-md mx-auto">
            Subscribe for botanical skincare guides, new soap variety announcements, and priority restock notifications.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2.5 pt-2">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 bg-white border border-[#E8DCDE] focus:border-[#C9A15B] rounded-xl text-xs text-[#29232B] focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#59172F] hover:bg-[#431022] text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              Subscribe
            </button>
          </form>

          {newsletterSuccess && (
            <p className="text-xs font-semibold text-emerald-700 animate-in fade-in">
              ✨ Thank you for subscribing to Comfy’s Glow updates!
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
