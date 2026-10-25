import React from 'react';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Heart, Shield } from 'lucide-react';
import { getWhatsAppInquiryLink } from '../utils/formatters.ts';
import { resolveAssetUrl } from '../utils/assets.ts';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#29232B] text-[#FFF9F2] pt-12 sm:pt-16 pb-28 sm:pb-12 border-t-2 border-[#C9A15B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand Info & Emblem */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full p-0.5 border border-[#C9A15B] bg-white overflow-hidden shrink-0">
                <img
                  src={resolveAssetUrl('/src/assets/images/comfys_glow_logo_1791541553890.jpg')}
                  alt="Comfy's Glow Logo"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-[#FFF9F2]">
                  Comfy’s Glow
                </h3>
                <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#C9A15B]">
                  Glow with Elegance
                </p>
              </div>
            </div>

            <p className="text-xs text-[#E9DDF2]/80 leading-relaxed">
              Handcrafted skincare & luxury fine fragrances rooted in Ado-Ekiti, Nigeria. We believe brightening is about revealing your natural skin radiance—nourishing your skin with pure botanicals without harsh bleaching.
            </p>

            <div className="pt-2">
              <a
                href={getWhatsAppInquiryLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#C9A15B] hover:bg-[#b58c46] text-[#29232B] text-xs font-bold transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Store Collections */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#C9A15B]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#E9DDF2]/80">
              <li>
                <button
                  onClick={() => onNavigate('soaps')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Our 5 Signature Soaps
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('perfumes')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Fine Perfumes Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('body-care-combos')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Body Scrubs & Glowing Butters
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('body-care-combos')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Value Combo Sets (Save up to ₦1,200)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('soaps')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Bulk & Wholesale Soap Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Info */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#C9A15B]">
              Customer Service
            </h4>
            <ul className="space-y-2 text-xs text-[#E9DDF2]/80">
              <li>
                <button
                  onClick={() => onNavigate('delivery')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Delivery Rates & Zones
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('faq')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  About Comfy’s Glow
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Contact Us & Location
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('auth')}
                  className="hover:text-[#C9A15B] transition-colors"
                >
                  Track Order / Customer Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Confirmed Contact Details & Social */}
          <div className="space-y-3.5">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#C9A15B]">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs text-[#E9DDF2]/85">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A15B] shrink-0 mt-0.5" />
                <span>Ado-Ekiti, Ekiti State, Nigeria</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C9A15B] shrink-0" />
                <div className="space-y-0.5">
                  <a href="tel:0000000000" className="block hover:text-[#C9A15B] transition-colors">
                    000-000-0000
                  </a>
                  <a href="tel:0000000000" className="block hover:text-[#C9A15B] transition-colors">
                    000-000-0000
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A15B] shrink-0" />
                <a
                  href="mailto:contact@example.invalid"
                  className="hover:text-[#C9A15B] transition-colors break-all"
                >
                  contact@example.invalid
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider text-[#C9A15B] block mb-2 font-semibold">
                Follow Our Glow
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/Comfy_glow24"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C9A15B] hover:text-[#29232B] flex items-center justify-center transition-colors text-white"
                  aria-label="Instagram: @Comfy_glow24"
                  title="Instagram: @Comfy_glow24"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://web.facebook.com/profile.php?id=100088602207052"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C9A15B] hover:text-[#29232B] flex items-center justify-center transition-colors text-white"
                  aria-label="Facebook: Comfort Oluwarantimi"
                  title="Facebook: Comfort Oluwarantimi"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href={getWhatsAppInquiryLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#C9A15B] hover:text-[#29232B] flex items-center justify-center transition-colors text-white"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Guarantee */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E9DDF2]/60 gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026 Comfy’s Glow. All rights reserved.</span>
            <span>•</span>
            <span>Glow with Elegance</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Doorstep Delivery: Ekiti & Ondo State</span>
            <span>•</span>
            <span>100% Non-Bleaching Botanical Formulas</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
