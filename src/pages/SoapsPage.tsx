import React, { useState } from 'react';
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  Star,
  MessageCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import type { Product } from '../types/index.ts';
import { formatNaira, getWhatsAppInquiryLink } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { resolveAssetUrl } from '../utils/assets.ts';

interface SoapsPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
  onPromptLogin: () => void;
}

export const SoapsPage: React.FC<SoapsPageProps> = ({
  products,
  onSelectProduct,
  onNavigate,
  onPromptLogin,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // The confirmed soap
  const blackSoap = products.find((p) => p.slug === 'comfys-black-beauty-soap') || products[0];

  // Bulk order calculator state
  const [wholesaleQty, setWholesaleQty] = useState(25);
  const [wholesaleName, setWholesaleName] = useState('');
  const [wholesalePhone, setWholesalePhone] = useState('');
  const [wholesaleNotes, setWholesaleNotes] = useState('');
  const [bulkSent, setBulkSent] = useState(false);

  // Soap varieties architecture
  const soapVarieties = [
    {
      num: 1,
      name: "Comfy's Black Beauty Soap",
      status: 'Active & Available Now',
      price: 4200,
      desc: 'Carrot root extract + Pure Aloe vera in authentic African black soap. Clears acne, evens complexion without bleaching.',
      available: true,
      product: blackSoap,
    },
    {
      num: 2,
      name: 'Signature Soap Variety #2',
      status: 'In Formulation / Atelier Batch',
      price: 4200,
      desc: 'Formulated in our Ado-Ekiti atelier. Official ingredients and details awaiting final business release.',
      available: false,
    },
    {
      num: 3,
      name: 'Signature Soap Variety #3',
      status: 'In Formulation / Atelier Batch',
      price: 4200,
      desc: 'Handmade cold-process botanical bar. Details pending publication by administrator.',
      available: false,
    },
    {
      num: 4,
      name: 'Signature Soap Variety #4',
      status: 'In Formulation / Atelier Batch',
      price: 4200,
      desc: 'Nourishing herbal cleansing bar. Details pending publication by administrator.',
      available: false,
    },
    {
      num: 5,
      name: 'Signature Soap Variety #5',
      status: 'In Formulation / Atelier Batch',
      price: 4200,
      desc: 'Soothing sensitive barrier repair soap. Details pending publication by administrator.',
      available: false,
    },
  ];

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wholesaleName || !wholesalePhone) return;

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wholesaleName,
          phone: wholesalePhone,
          subject: `Wholesale Soap Request: ${wholesaleQty} units`,
          message: `Wholesale Inquiry for ${wholesaleQty} units of Comfy's Soaps.\nCustomer: ${wholesaleName} (${wholesalePhone})\nNotes: ${wholesaleNotes || 'None'}`,
        }),
      });
      setBulkSent(true);
      setTimeout(() => setBulkSent(false), 5000);
    } catch {
      setBulkSent(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
          Artisanal Cleansing
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#59172F]">
          Our 5 Soap Varieties
        </h1>
        <p className="text-xs sm:text-sm text-[#5D5560] leading-relaxed">
          Crafted in Ado-Ekiti, Ekiti State. We formulate five distinct soap recipes to nourish, heal, and illuminate African skin types without caustic bleaching agents.
        </p>
      </div>

      {/* 2. Flagship Soap Hero Spotlight: Comfy's Black Beauty Soap */}
      {blackSoap && (
        <div className="bg-white rounded-3xl border border-[#C9A15B]/30 shadow-lg p-6 sm:p-10 lg:p-12 overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Image */}
            <div className="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden bg-[#FAF5EE] border border-[#E8DCDE]">
              <img
                src={resolveAssetUrl(blackSoap.image)}
                alt={blackSoap.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                fetchPriority="high"
                decoding="async"
              />
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#59172F] text-[#FFF9F2] text-xs font-bold rounded-lg shadow-sm">
                Variety #1 • Confirmed
              </span>
            </div>

            {/* Details */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#C9A15B] uppercase tracking-wider">
                  <span>Pure African Black Soap Base</span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 text-[#29232B]">
                    <Star className="w-3.5 h-3.5 text-[#C9A15B] fill-current" />
                    <span>4.9 (38 Reviews)</span>
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
                  {blackSoap.name}
                </h2>
                <div className="text-2xl font-bold text-[#59172F] font-mono tabular-nums pt-1">
                  {formatNaira(blackSoap.price)}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#4A434D] leading-relaxed">
                {blackSoap.description}
              </p>

              {/* Verified ingredients / highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-[#29232B]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Enriched with Carrot Root Extract</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#29232B]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pure Aloe Vera Soothing Gel</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#29232B]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Clears Acne & Stubborn Pimples</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#29232B]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Non-Drying, Gentle On Barrier</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => addToCart(blackSoap, 1)}
                  className="px-6 py-3 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C9A15B]" />
                  <span>Add to Bag ({formatNaira(blackSoap.price)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProduct(blackSoap)}
                  className="px-5 py-3 border border-[#C9A15B] text-[#59172F] hover:bg-[#FFF9F2] text-xs font-semibold rounded-xl transition-colors text-center"
                >
                  View Details & Reviews
                </button>

                <a
                  href={getWhatsAppInquiryLink(blackSoap.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
                  title="Inquire on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="sm:hidden">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. The 5 Soap Varieties Architecture Grid */}
      <div className="space-y-6">
        <div>
          <h3 className="font-serif text-2xl font-bold text-[#59172F]">
            The 5 Soap Varieties Architecture
          </h3>
          <p className="text-xs text-[#736B76] mt-1">
            As per business specifications, Comfy’s Glow produces exactly five varieties. Comfy Black Beauty Soap is confirmed and available. The remaining four varieties are managed as draft records in the admin dashboard until final specifications are released.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {soapVarieties.map((v) => (
            <div
              key={v.num}
              className={`p-6 rounded-2xl border transition-all ${
                v.available
                  ? 'bg-white border-[#C9A15B] shadow-md'
                  : 'bg-[#FAF5EE]/60 border-slate-200/80 opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#C9A15B] font-mono">
                  Variety 0{v.num}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    v.available
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <h4 className="font-serif text-lg font-bold text-[#29232B] mb-2">{v.name}</h4>
              <p className="text-xs text-[#5D5560] leading-relaxed mb-4">{v.desc}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-[#59172F] font-mono tabular-nums">
                  {formatNaira(v.price)}
                </span>
                {v.available && v.product && (
                  <button
                    onClick={() => addToCart(v.product!, 1)}
                    className="text-xs font-bold text-[#59172F] hover:underline"
                  >
                    Add to Bag →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. BULK & WHOLESALE ORDER INQUIRY CALCULATOR */}
      <div className="bg-[#FFF9F2] rounded-3xl border border-[#C9A15B]/40 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A15B] flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4" />
              <span>Commercial & Event Orders</span>
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#59172F]">
              Wholesale & Bulk Production Orders
            </h3>
            <p className="text-xs sm:text-sm text-[#4A434D] leading-relaxed">
              We supply retail boutiques, spa owners, hotels, wedding souvenirs, and distributors across Ekiti and Ondo State with direct bulk pricing and customized batches.
            </p>
            <div className="space-y-2 text-xs text-[#5D5560]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A15B]" />
                <span>Custom batch size production (from 25 up to 500+ jars)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A15B]" />
                <span>Dedicated delivery coordination to your doorstep or bus park</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C9A15B]" />
                <span>Flexible payment arrangements confirmed directly with administration</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E8DCDE] shadow-xs">
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <h4 className="font-serif text-base font-bold text-[#59172F]">
                Request Bulk Quantity Quote
              </h4>

              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">
                  Target Quantity (Jars / Bars): <span className="text-[#59172F] font-bold">{wholesaleQty} units</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={wholesaleQty}
                  onChange={(e) => setWholesaleQty(Number(e.target.value))}
                  className="w-full accent-[#59172F]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>20 units</span>
                  <span>100 units</span>
                  <span>200+ units</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={wholesaleName}
                    onChange={(e) => setWholesaleName(e.target.value)}
                    placeholder="e.g. Grace Bolanle"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C9A15B]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={wholesalePhone}
                    onChange={(e) => setWholesalePhone(e.target.value)}
                    placeholder="080... or 070..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C9A15B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Delivery Location or Requirements</label>
                <textarea
                  rows={2}
                  value={wholesaleNotes}
                  onChange={(e) => setWholesaleNotes(e.target.value)}
                  placeholder="e.g. Ado-Ekiti shop stock, or wedding souvenirs in Akure..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#C9A15B]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Submit Bulk Production Inquiry
              </button>

              {bulkSent && (
                <p className="text-xs text-center font-semibold text-emerald-700">
                  ✨ Inquiry submitted! Our team will call or WhatsApp you directly.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
