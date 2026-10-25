import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
  HelpCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { formatNaira } from '../utils/formatters.ts';
import { resolveAssetUrl } from '../utils/assets.ts';
import type { DeliveryZone, Order } from '../types/index.ts';

interface CheckoutPageProps {
  onOrderCompleted: (order: Order) => void;
  onNavigate: (view: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onOrderCompleted, onNavigate }) => {
  const { items, subtotal, clearCart } = useCart();
  const { user, token, isAuthenticated, login, register } = useAuth();

  // Form fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [town, setTown] = useState(user?.city || 'Ado-Ekiti');
  const [state, setState] = useState(user?.state || 'Ekiti State');
  const [instructions, setInstructions] = useState('');
  const [contactPreference, setContactPreference] = useState<'whatsapp' | 'call' | 'sms'>('whatsapp');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  // Delivery calculation states
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [deliveryFee, setDeliveryFee] = useState<number>(1500);
  const [manualConfirmationRequired, setManualConfirmationRequired] = useState(false);
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);

  // Auth gate inline toggle
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync user data if user logs in
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');
      if (user.address) setAddress(user.address);
      if (user.city) setTown(user.city);
      if (user.state) setState(user.state);
    }
  }, [user]);

  // Fetch delivery zones on mount
  useEffect(() => {
    fetch('/api/delivery-zones')
      .then((res) => res.json())
      .then((data) => {
        if (data.zones) setZones(data.zones);
      })
      .catch((err) => console.error(err));
  }, []);

  // Recalculate delivery fee when location changes
  useEffect(() => {
    setCalculatingDelivery(true);
    fetch('/api/delivery-zones/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, town, zoneId: selectedZoneId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setDeliveryFee(data.fee);
        setManualConfirmationRequired(data.manualConfirmationRequired);
      })
      .catch((e) => console.error(e))
      .finally(() => setCalculatingDelivery(false));
  }, [state, town, selectedZoneId]);

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'login') {
      const res = await login(authEmail, authPassword);
      if (!res.success) setAuthError(res.error || 'Login failed.');
    } else {
      const res = await register({
        fullName: authName,
        email: authEmail,
        phone: authPhone,
        password: authPassword,
      });
      if (!res.success) setAuthError(res.error || 'Registration failed.');
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isAuthenticated || !token) {
      setErrorMsg('Please sign in or register an account before placing an order.');
      return;
    }

    if (items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    if (!address.trim() || !town.trim() || !state.trim()) {
      setErrorMsg('Please enter your full delivery address, town/city, and state.');
      return;
    }

    setSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedVariant: item.selectedVariant,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          phone,
          altPhone,
          deliveryAddress: address,
          deliveryTown: town,
          deliveryState: state,
          deliveryInstructions: instructions,
          zoneId: selectedZoneId,
          contactPreference,
          items: orderItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      clearCart();
      onOrderCompleted(data.order);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting your order.');
    } finally {
      setSubmitting(false);
    }
  };

  const grandTotal = subtotal + deliveryFee;

  // Empty cart redirect
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#59172F]">Your Cart is Empty</h2>
        <p className="text-xs text-[#736B76]">Add your favorite soaps or perfumes to proceed with your order.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-6 py-2.5 bg-[#59172F] text-white text-xs font-bold rounded-xl"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#E8DCDE] pb-4">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#59172F] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>

        <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#59172F]">
          Website Order Form
        </h1>

        <div className="text-xs text-[#736B76] hidden sm:block">
          Secure Order Submission
        </div>
      </div>

      {/* Main Grid: Form on Left, Order Snapshot on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Form & Customer Details */}
        <div className="lg:col-span-7 space-y-8">
          {/* Rule Enforcement: Must be authenticated */}
          {!isAuthenticated ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#C9A15B]/50 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E9DDF2] text-[#59172F] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#59172F]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#59172F]">
                    Customer Sign In Required
                  </h3>
                  <p className="text-xs text-[#736B76]">
                    Please sign in or register to place your order. This secures your order reference and order history tracking.
                  </p>
                </div>
              </div>

              {/* Toggle Auth Mode */}
              <div className="flex p-1 bg-slate-100 rounded-lg max-w-xs">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    authMode === 'login' ? 'bg-white text-[#59172F] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    authMode === 'register' ? 'bg-white text-[#59172F] shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Register Account
                </button>
              </div>

              <form onSubmit={handleInlineAuth} className="space-y-4">
                {authMode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Mary Olawale"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="0802 000 0000"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="text-[11px] font-semibold text-[#59172F] hover:text-[#C9A15B] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {showAuthPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showAuthPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAuthPassword ? 'text' : 'password'}
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#C9A15B]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#59172F] p-1 cursor-pointer"
                      title={showAuthPassword ? 'Hide password' : 'Show password'}
                      aria-label={showAuthPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authError && <p className="text-xs text-rose-600">{authError}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#59172F] hover:bg-[#431022] text-white text-xs font-bold rounded-lg transition-colors"
                >
                  {authMode === 'login' ? 'Sign In & Continue Order' : 'Register & Continue Order'}
                </button>
              </form>
            </div>
          ) : (
            /* Logged in Customer Order Form */
            <form onSubmit={handleOrderSubmit} className="space-y-6">
              {/* Step 1: Customer Identification */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCDE] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-serif text-base font-bold text-[#59172F]">
                    1. Recipient Information
                  </h3>
                  <span className="text-xs text-[#736B76]">Signed in as {user?.email}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#29232B] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Adebayo Folashade"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#29232B] mb-1">
                      Primary Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="000-000-0000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#29232B] mb-1">
                      Alternative Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      placeholder="Secondary contact or WhatsApp"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#29232B] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Destination */}
              <div className="bg-white rounded-2xl p-6 border border-[#E8DCDE] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-serif text-base font-bold text-[#59172F]">
                    2. Delivery Location & Zone
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-emerald-700">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Calculated dynamically</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#29232B] mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none font-medium"
                    >
                      <option value="Ekiti State">Ekiti State (Core Coverage)</option>
                      <option value="Ondo State">Ondo State (Core Coverage)</option>
                      <option value="Lagos State">Lagos State (Courier Shuttle)</option>
                      <option value="Osun State">Osun State (Courier Shuttle)</option>
                      <option value="Oyo State">Oyo State (Courier Shuttle)</option>
                      <option value="Abuja FCT">Abuja FCT (Courier Shuttle)</option>
                      <option value="Other States">Other Nigerian State (Manual Rate Confirmation)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#29232B] mb-1">
                      Town / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={town}
                      onChange={(e) => setTown(e.target.value)}
                      placeholder="e.g. Ado-Ekiti, Ikere, Oye, Akure..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Specific Zone Selection if Ekiti / Ondo */}
                <div>
                  <label className="block text-xs font-semibold text-[#29232B] mb-1">
                    Select Nearest Delivery Zone
                  </label>
                  <select
                    value={selectedZoneId}
                    onChange={(e) => setSelectedZoneId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none"
                  >
                    <option value="">Auto-Detect from Town / City</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.state}: {zone.areaName} ({formatNaira(zone.fee)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#29232B] mb-1">
                    Street Address / Landmark *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House number, street name, nearest bus stop or landmark..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#29232B] mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Leave with security, call before arrival, office delivery hours..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:border-[#C9A15B] focus:outline-none"
                  />
                </div>

                {/* Preferred Contact Method */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-[#29232B] mb-2">
                    Preferred Communication Channel for Order Confirmation:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      { id: 'call', label: 'Phone Call', icon: Truck },
                      { id: 'sms', label: 'SMS Text', icon: CheckCircle2 },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setContactPreference(m.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          contactPreference === m.id
                            ? 'bg-[#59172F] text-white border-[#59172F] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <m.icon className="w-3.5 h-3.5" />
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Transparent Payment Terms Notice */}
              <div className="bg-[#FAF5EE] rounded-2xl p-5 border border-[#C9A15B]/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#59172F]">
                  <ShieldCheck className="w-4 h-4 text-[#C9A15B]" />
                  <span>Transparent Payment Terms (No Online Card Charges)</span>
                </div>
                <p className="text-xs text-[#5D5560] leading-relaxed">
                  To safeguard your financial details, we do not require card numbers on this website. Once submitted, your order reference is saved in our system. You will receive bank transfer details directly or arrange payment upon delivery confirmation.
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Placing Order...' : `Submit Order • Total ${formatNaira(grandTotal)}`}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Order Items Snapshot & Totals */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DCDE] shadow-xs space-y-6 sticky top-28">
          <h3 className="font-serif text-lg font-bold text-[#59172F] border-b border-slate-100 pb-3">
            Order Summary ({items.length} items)
          </h3>

          {/* List of items */}
          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 text-xs items-center">
                <img
                  src={resolveAssetUrl(item.product.image)}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#29232B] truncate">{item.product.name}</h4>
                  {item.selectedVariant && (
                    <p className="text-[11px] text-[#736B76]">{item.selectedVariant}</p>
                  )}
                  <p className="text-[11px] text-[#736B76]">
                    Qty: {item.quantity} × {formatNaira(item.unitPrice)}
                  </p>
                </div>
                <span className="font-bold text-[#59172F] font-mono tabular-nums">
                  {formatNaira(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Cost breakdown */}
          <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-[#736B76]">
              <span>Cart Subtotal</span>
              <span className="font-bold text-[#29232B] font-mono tabular-nums">{formatNaira(subtotal)}</span>
            </div>

            <div className="flex justify-between text-[#736B76]">
              <span>Delivery Fee ({town}, {state})</span>
              <span className="font-bold text-[#29232B] font-mono tabular-nums">
                {calculatingDelivery ? (
                  'Calculating...'
                ) : manualConfirmationRequired ? (
                  <span className="text-amber-700 italic">Rate requires confirmation</span>
                ) : (
                  formatNaira(deliveryFee)
                )}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-serif text-base font-bold text-[#29232B]">Total Amount</span>
              <span className="font-serif text-2xl font-bold text-[#59172F] font-mono tabular-nums">
                {formatNaira(grandTotal)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#FFF9F2] rounded-xl border border-[#C9A15B]/30 text-[11px] text-[#736B76] space-y-1">
            <div className="font-semibold text-[#59172F]">Customer Satisfaction Promise</div>
            <p>
              Your order total is guaranteed. Subsequent catalogue price changes will not alter this confirmed snapshot.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
