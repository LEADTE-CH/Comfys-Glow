import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import type { FAQ } from '../types/index.ts';
import { getWhatsAppInquiryLink } from '../utils/formatters.ts';

export const FAQPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.faqs) setFaqs(data.settings.faqs);
      })
      .catch((e) => console.error(e));
  }, []);

  const categories = ['All', ...new Set(faqs.map((f) => f.category))];

  const filteredFaqs =
    selectedCategory === 'All' ? faqs : faqs.filter((f) => f.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
          Answers & Guidance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#59172F]">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#5D5560] leading-relaxed max-w-xl mx-auto">
          Clear answers about ordering online, our non-bleaching soap formulations, delivery fees in Ekiti and Ondo State, and payment coordination.
        </p>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#59172F] text-white shadow-xs'
                  : 'bg-white border border-[#E8DCDE] text-slate-700 hover:border-[#C9A15B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-[#E8DCDE] overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-serif text-base font-bold text-[#29232B]">{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#C9A15B] transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#59172F]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-xs text-[#4A434D] leading-relaxed border-t border-slate-50">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Banner */}
      <div className="p-8 bg-[#FAF5EE] rounded-3xl border border-[#C9A15B]/30 text-center space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#59172F]">Have a question not listed here?</h3>
        <p className="text-xs text-[#736B76] max-w-md mx-auto">
          Our friendly customer care team is available daily in Ado-Ekiti to assist you with advice or orders.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => onNavigate('contact')}
            className="px-5 py-2.5 bg-[#59172F] text-white text-xs font-bold rounded-xl"
          >
            Contact Customer Care
          </button>
          <a
            href={getWhatsAppInquiryLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
