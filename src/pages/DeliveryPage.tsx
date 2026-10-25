import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Clock, ShieldCheck, CheckCircle2, HelpCircle } from 'lucide-react';
import type { DeliveryZone } from '../types/index.ts';
import { formatNaira } from '../utils/formatters.ts';

export const DeliveryPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/delivery-zones')
      .then((res) => res.json())
      .then((data) => {
        if (data.zones) setZones(data.zones);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15B]">
          Fast & Reliable Transit
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#59172F]">
          Delivery Information & Rates
        </h1>
        <p className="text-xs sm:text-sm text-[#5D5560] leading-relaxed">
          We operate direct doorstep delivery throughout Ekiti State and in Akure, Ondo State. Delivery fees are managed transparently by zone and calculated automatically at checkout.
        </p>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCDE] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-[#59172F]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#29232B]">Confirmed Service Zones</h3>
          <p className="text-xs text-[#5D5560] leading-relaxed">
            All towns across <strong>Ekiti State</strong> (Ado-Ekiti, Ikere, Oye, Ijero, etc.) and <strong>Akure, Ondo State</strong>.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8DCDE] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center">
            <Clock className="w-5 h-5 text-[#59172F]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#29232B]">Estimated Delivery Window</h3>
          <p className="text-xs text-[#5D5560] leading-relaxed">
            Same-day to 24 hours within Ado-Ekiti town. 24–48 hours for other Ekiti towns and transit to Akure.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8DCDE] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E9DDF2] text-[#59172F] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#59172F]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#29232B]">Secure Handling</h3>
          <p className="text-xs text-[#5D5560] leading-relaxed">
            All glass flacons and cosmetic jars are padded to prevent transit leakage or breakages.
          </p>
        </div>
      </div>

      {/* Live Admin-Managed Delivery Rates Table */}
      <div className="bg-white rounded-3xl border border-[#C9A15B]/30 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#59172F]">
              Configured Delivery Rates
            </h2>
            <p className="text-xs text-[#736B76]">
              Real-time rates managed by administration. These exact amounts apply to your order form.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Active Zones
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#736B76]">Loading delivery rates...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCDE] text-[#C9A15B] uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 font-bold">State</th>
                  <th className="py-3 px-4 font-bold">Coverage Area / Town</th>
                  <th className="py-3 px-4 font-bold">Standard Fee</th>
                  <th className="py-3 px-4 font-bold">Estimated Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-[#FFF9F2] transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#59172F] whitespace-nowrap">
                      {zone.state}
                    </td>
                    <td className="py-3.5 px-4 text-[#29232B]">
                      {zone.areaName}
                      {zone.notes && (
                        <span className="block text-[11px] text-[#736B76] italic">{zone.notes}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#29232B] whitespace-nowrap">
                      {formatNaira(zone.fee)}
                    </td>
                    <td className="py-3.5 px-4 text-[#736B76] whitespace-nowrap">
                      {zone.estimatedDeliveryDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notice for Outside Areas */}
      <div className="bg-[#FAF5EE] rounded-2xl p-6 sm:p-8 border border-[#E8DCDE] space-y-3">
        <h3 className="font-serif text-lg font-bold text-[#59172F] flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#C9A15B]" />
          <span>Ordering from Outside Ekiti & Ondo State?</span>
        </h3>
        <p className="text-xs text-[#5D5560] leading-relaxed">
          If your delivery location is outside our core delivery zones (e.g. Lagos, Abuja, Osun, Oyo, Rivers), you can still submit your order form. The website will flag that the rate requires manual confirmation. Our admin team will verify current courier or interstate shuttle rates and communicate the charge to you before payment and dispatch.
        </p>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('home')}
          className="px-8 py-3.5 bg-[#59172F] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#431022] transition-colors"
        >
          Start Shopping
        </button>
      </div>
    </div>
  );
};
