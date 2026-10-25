import React from 'react';
import {
  CheckCircle,
  PackageCheck,
  MessageCircle,
  Phone,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
} from 'lucide-react';
import type { Order } from '../types/index.ts';
import { formatNaira, getWhatsAppOrderLink } from '../utils/formatters.ts';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigate,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      {/* Top Success Badge & Reference */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#C9A15B]/40 shadow-lg text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle className="w-8 h-8" />
        </div>

        <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#C9A15B] block">
          Order Successfully Submitted
        </span>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#59172F]">
          Thank You, {order.customer.fullName.split(' ')[0]}!
        </h1>

        <p className="text-xs sm:text-sm text-[#4A434D] max-w-lg mx-auto leading-relaxed">
          Your order has been recorded in our database. We have generated your unique reference code below for tracking and payment arrangement.
        </p>

        {/* Highlighted Order Reference Card */}
        <div className="bg-[#FFF9F2] p-5 rounded-2xl border-2 border-[#C9A15B] inline-block max-w-md w-full my-2">
          <span className="text-[11px] uppercase tracking-wider text-[#736B76] block mb-1 font-semibold">
            Your Order Reference Code
          </span>
          <span className="font-mono text-2xl sm:text-3xl font-extrabold text-[#59172F] tracking-wide select-all">
            {order.reference}
          </span>
        </div>

        {/* Instant WhatsApp Action */}
        <div className="pt-2">
          <a
            href={getWhatsAppOrderLink(
              order.reference,
              order.total,
              order.items.length,
              order.delivery.town
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp to Confirm Payment</span>
          </a>
        </div>
      </div>

      {/* Itemized Order Snapshot */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="font-serif text-lg font-bold text-[#59172F]">
            Order Details & Items
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Status: {order.status.toUpperCase()}
          </span>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
              <div>
                <h4 className="font-semibold text-[#29232B]">{item.name}</h4>
                {item.selectedVariant && (
                  <span className="text-[11px] text-[#736B76]">{item.selectedVariant} • </span>
                )}
                <span className="text-[11px] text-[#736B76]">
                  Qty: {item.quantity} × {formatNaira(item.unitPrice)}
                </span>
              </div>
              <span className="font-bold text-[#59172F] font-mono tabular-nums">
                {formatNaira(item.lineTotal)}
              </span>
            </div>
          ))}
        </div>

        {/* Cost Summary */}
        <div className="pt-2 space-y-1.5 text-xs text-[#736B76]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-[#29232B] font-mono tabular-nums">{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span className="font-bold text-[#29232B] font-mono tabular-nums">
              {order.deliveryFee > 0 ? formatNaira(order.deliveryFee) : 'To be confirmed'}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-[#59172F]">
            <span>Total Payable</span>
            <span className="font-mono tabular-nums text-lg">{formatNaira(order.total)}</span>
          </div>
        </div>

        {/* Delivery Destination */}
        <div className="p-4 bg-[#FAF5EE] rounded-xl border border-[#E8DCDE] text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#59172F]">
            <MapPin className="w-3.5 h-3.5 text-[#C9A15B]" />
            <span>Delivery Destination:</span>
          </div>
          <p className="text-[#4A434D]">
            {order.delivery.address}, {order.delivery.town}, {order.delivery.state}
          </p>
          <p className="text-[#736B76]">
            Phone: {order.customer.phone} {order.customer.altPhone ? `| Alt: ${order.customer.altPhone}` : ''}
          </p>
        </div>
      </div>

      {/* Next Steps Guidance */}
      <div className="bg-[#FFF9F2] p-6 rounded-2xl border border-[#C9A15B]/30 space-y-3">
        <h3 className="font-serif text-base font-bold text-[#59172F]">What Happens Next?</h3>
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#5D5560] leading-relaxed">
          <li>Our Ado-Ekiti team reviews your order and checks current inventory.</li>
          <li>We will contact you via {order.contactPreference.toUpperCase()} to confirm delivery scheduling and payment arrangement (Bank Transfer / Cash).</li>
          <li>Once payment is confirmed, your order status changes to <em>Confirmed</em> and automated email notifications are generated.</li>
          <li>Your parcel is dispatched for swift delivery to your doorstep.</li>
        </ol>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <button
          onClick={() => onNavigate('account', 'orders')}
          className="w-full sm:w-auto px-6 py-3 border border-[#59172F] text-[#59172F] hover:bg-[#59172F] hover:text-white rounded-xl text-xs font-bold transition-colors text-center"
        >
          View in My Order History
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="w-full sm:w-auto px-6 py-3 bg-[#59172F] text-white hover:bg-[#431022] rounded-xl text-xs font-bold transition-colors text-center"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};
