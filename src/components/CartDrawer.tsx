import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { formatNaira } from '../utils/formatters.ts';
import { resolveAssetUrl } from '../utils/assets.ts';

interface CartDrawerProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout, onContinueShopping }) => {
  const { items, itemCount, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FFF9F2] shadow-2xl flex flex-col border-l border-[#C9A15B]/30 animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-5 border-b border-[#E8DCDE] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#59172F]" />
              <h2 className="font-serif text-lg font-bold text-[#59172F]">Your Beauty Bag</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E9DDF2] text-[#59172F]">
                {itemCount}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-[#59172F] hover:bg-[#E9DDF2]/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#736B76]">
                <div className="w-16 h-16 rounded-full bg-[#E9DDF2]/60 flex items-center justify-center mb-4 text-[#59172F]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#29232B] mb-1">Your bag is empty</h3>
                <p className="text-xs text-[#5D5560] max-w-xs mb-6">
                  Explore our handcrafted soaps, glowing body butters, and fine luxury perfumes.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onContinueShopping();
                  }}
                  className="px-5 py-2.5 bg-[#59172F] hover:bg-[#431022] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3.5 rounded-xl border border-[#E8DCDE] flex gap-3.5 shadow-2xs items-start"
                >
                  <img
                    src={resolveAssetUrl(item.product.image)}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-50 shrink-0 border border-slate-100"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-semibold text-[#29232B] truncate leading-tight">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedVariant && (
                      <p className="text-[11px] text-[#736B76] mt-0.5">
                        Variant: {item.selectedVariant}
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between">
                      {/* Quantity Steppers */}
                      <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-[#59172F] font-mono tabular-nums">
                        {formatNaira(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Total */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E8DCDE] bg-white space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#736B76]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#29232B] font-mono tabular-nums">
                    {formatNaira(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#736B76]">
                  <span>Delivery Charge</span>
                  <span className="italic text-[#C9A15B]">Calculated by location at checkout</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-serif text-sm font-bold text-[#29232B]">Estimated Subtotal</span>
                <span className="font-serif text-lg font-bold text-[#59172F] font-mono tabular-nums">
                  {formatNaira(subtotal)}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  className="w-full py-3 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Website Order Form</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A15B] group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-[10px] text-center text-[#736B76]">
                  Doorstep delivery in Ekiti State & Akure • No online card charges
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
