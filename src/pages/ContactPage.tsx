import React, { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Clock, Send, CheckCircle2 } from 'lucide-react';
import { getWhatsAppInquiryLink } from '../utils/formatters.ts';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }
      setSentSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSentSuccess(false), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
          We Are Here For You
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#59172F]">
          Contact Comfy’s Glow
        </h1>
        <p className="text-xs sm:text-sm text-[#5D5560] leading-relaxed">
          Have inquiries about bulk soap orders, delivery rates, or personalized fragrance recommendations? Reach our Ado-Ekiti team directly via telephone, WhatsApp, or through the message form below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Direct Contact Details & Hours */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#59172F] border-b border-slate-100 pb-3">
              Direct Contact Channels
            </h3>

            <div className="space-y-4 text-xs">
              {/* Phones */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4 text-[#59172F]" />
                </div>
                <div>
                  <span className="font-bold text-[#29232B] block text-sm">Telephone Contacts</span>
                  <a href="tel:0000000000" className="block text-[#59172F] font-semibold hover:underline mt-0.5">
                    000-000-0000
                  </a>
                  <a href="tel:0000000000" className="block text-[#59172F] font-semibold hover:underline">
                    000-000-0000
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-[#59172F]" />
                </div>
                <div>
                  <span className="font-bold text-[#29232B] block text-sm">Email Address</span>
                  <a
                    href="mailto:contact@example.invalid"
                    className="text-[#59172F] font-semibold hover:underline break-all"
                  >
                    contact@example.invalid
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-[#59172F]" />
                </div>
                <div>
                  <span className="font-bold text-[#29232B] block text-sm">Physical Boutique Atelier</span>
                  <p className="text-[#5D5560] mt-0.5 leading-relaxed">
                    Ado-Ekiti, Ekiti State, Nigeria
                  </p>
                </div>
              </div>

              {/* WhatsApp Quick Link */}
              <div className="pt-2">
                <a
                  href={getWhatsAppInquiryLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start Live Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="bg-[#FAF5EE] rounded-3xl p-6 border border-[#C9A15B]/30 space-y-3">
            <h4 className="font-serif text-base font-bold text-[#59172F]">
              Follow & Tag Our Brand
            </h4>
            <p className="text-xs text-[#736B76]">
              Stay tuned for real transformation testimonials and new scent drops.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <a
                href="https://instagram.com/Comfy_glow24"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white border border-[#E8DCDE] rounded-xl text-xs font-semibold text-[#59172F] flex items-center gap-1.5 hover:border-[#C9A15B] transition-colors"
                title="Follow @Comfy_glow24 on Instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-[#C9A15B]" />
                <span>Instagram (@Comfy_glow24)</span>
              </a>
              <a
                href="https://web.facebook.com/profile.php?id=100088602207052"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white border border-[#E8DCDE] rounded-xl text-xs font-semibold text-[#59172F] flex items-center gap-1.5 hover:border-[#C9A15B] transition-colors"
                title="Connect with Comfort Oluwarantimi on Facebook"
              >
                <Facebook className="w-3.5 h-3.5 text-[#C9A15B]" />
                <span>Facebook (Comfort Oluwarantimi)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DCDE] shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#59172F]">Send a Direct Message</h3>
            <p className="text-xs text-[#736B76] mt-1">
              Your message will be sent straight to our boutique administration desk.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Joy Oluwaseun"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="000-000-0000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Bulk order inquiry, Delivery rate..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#29232B] mb-1">Message *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we assist your glow journey today?..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#C9A15B]"
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-600">{errorMsg}</p>}

            {sentSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your inquiry has been sent to Comfy’s Glow administration.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-[#C9A15B]" />
              <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
