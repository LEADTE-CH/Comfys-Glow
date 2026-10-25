import React from 'react';
import { Sparkles, ShieldCheck, Heart, Leaf, MapPin, Award } from 'lucide-react';
import { resolveAssetUrl } from '../utils/assets.ts';

export const AboutPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Brand Story Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
          Our Brand Philosophy
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#59172F] leading-tight">
          Where Glow Meets Elegance.
        </h1>
        <p className="text-base sm:text-lg text-[#5D5560] font-serif italic leading-relaxed">
          &ldquo;Brightening isn&rsquo;t bleaching, but caring for your skin with nature&rsquo;s purest botanicals.&rdquo;
        </p>
      </div>

      {/* Origin Story & Heritage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 relative aspect-4/3 rounded-3xl overflow-hidden border border-[#C9A15B]/30 shadow-xl bg-[#FAF5EE]">
          <img
            src={resolveAssetUrl('/src/assets/images/comfy_hero_collection_1791541604861.jpg')}
            alt="Comfy's Glow Botanical Craft"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A15B]">
            <MapPin className="w-4 h-4" />
            <span>Rooted in Ado-Ekiti, Ekiti State</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
            The Journey of Comfy’s Glow
          </h2>

          <p className="text-xs sm:text-sm text-[#4A434D] leading-relaxed">
            Comfy’s Glow was born out of a desire to redefine personal skincare in Nigeria. Witnessing the damage caused by harsh bleaching chemical creams that compromise the skin’s protective melanin and barrier, our founder set out on a cinematic journey with a single core remedy: <strong>Comfy’s Black Beauty Soap</strong>.
          </p>

          <p className="text-xs sm:text-sm text-[#4A434D] leading-relaxed">
            As transformations poured in—healing stubborn acne, fading post-inflammatory dark spots, and reviving natural glow—the business expanded its craft into exfoliating turmeric and coffee scrubs, whipped shea body butters, shimmering botanical oils, and curated fine fragrances.
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-[#29232B]">
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E8DCDE]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero Caustic Bleaching Agents</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E8DCDE]">
              <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pure Aloe & Carrot Extracts</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E8DCDE]">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>5 Signature Soap Varieties</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-[#E8DCDE]">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Long-Lasting Fine Fragrances</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-[#FAF4EB] rounded-3xl p-8 sm:p-12 border border-[#C9A15B]/30 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
            Our Guiding Commitments
          </h3>
          <p className="text-xs text-[#736B76]">The foundational standards behind every jar and flacon.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8DCDE] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center font-bold font-serif">
              01
            </div>
            <h4 className="font-serif text-lg font-bold text-[#29232B]">Melanin Respect</h4>
            <p className="text-xs text-[#5D5560] leading-relaxed">
              We never lighten by damaging skin cells. Our botanical actives work with your skin’s natural rhythm to even skin tone, remove dead cells, and reflect healthy light.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8DCDE] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center font-bold font-serif">
              02
            </div>
            <h4 className="font-serif text-lg font-bold text-[#29232B]">Artisanal Handcrafting</h4>
            <p className="text-xs text-[#5D5560] leading-relaxed">
              Every soap batch is cured in Ado-Ekiti using authentic African black soap bases, plantain ash, virgin coconut oil, and rich unrefined shea butter.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8DCDE] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center font-bold font-serif">
              03
            </div>
            <h4 className="font-serif text-lg font-bold text-[#29232B]">Real Value & Integrity</h4>
            <p className="text-xs text-[#5D5560] leading-relaxed">
              Transparent Nigerian Naira pricing, generous product quantities (250g jars), genuine bundle savings, and direct personal customer service.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="font-serif text-2xl font-bold text-[#59172F]">Ready to Experience the Glow?</h3>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onNavigate('soaps')}
            className="px-6 py-3 bg-[#59172F] text-white text-xs font-bold uppercase rounded-xl hover:bg-[#431022] transition-colors"
          >
            Explore Soaps
          </button>
          <button
            onClick={() => onNavigate('perfumes')}
            className="px-6 py-3 border border-[#C9A15B] text-[#59172F] text-xs font-bold uppercase rounded-xl hover:bg-white transition-colors"
          >
            Shop Perfumes
          </button>
        </div>
      </div>
    </div>
  );
};
