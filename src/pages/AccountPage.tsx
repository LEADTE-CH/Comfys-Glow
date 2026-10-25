import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  Calendar,
  ExternalLink,
  Mail,
  ChevronRight,
  Eye,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import type { Order, Product } from '../types/index.ts';
import { formatNaira, formatDate, getWhatsAppOrderLink } from '../utils/formatters.ts';
import { resolveAssetUrl } from '../utils/assets.ts';

interface AccountPageProps {
  initialTab?: string;
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  initialTab = 'orders',
  onSelectProduct,
  onNavigate,
}) => {
  const { user, token, logout, updateProfile } = useAuth();
  const { wishlistProducts, moveToCart, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>(
    initialTab as any || 'orders'
  );

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderEmails, setOrderEmails] = useState<any[]>([]);

  // Profile edit state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (initialTab && (initialTab === 'orders' || initialTab === 'wishlist' || initialTab === 'profile')) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (user && token) {
      setLoadingOrders(true);
      fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch((e) => console.error(e))
        .finally(() => setLoadingOrders(false));
    }
  }, [user, token]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile({ fullName, phone, address, city, state });
    if (ok) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleViewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrderEmails(data.emails || []);
      }
    } catch {
      setOrderEmails([]);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dispatched':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Account Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#E9DDF2] text-[#59172F] flex items-center justify-center font-serif text-2xl font-bold shrink-0 border border-[#C9A15B]">
            {user?.fullName.charAt(0) || 'C'}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#59172F]">
              Hello, {user?.fullName}
            </h1>
            <p className="text-xs text-[#736B76]">{user?.email} • {user?.phone}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-[#C9A15B] font-semibold">
              <span>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}</span>
              <span>•</span>
              <span>Ado-Ekiti Customer Portal</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 border border-slate-200 hover:border-rose-300 text-xs font-semibold text-rose-600 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-[#E8DCDE] gap-1 sm:gap-2 overflow-x-auto scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-[#59172F] text-[#59172F]'
              : 'border-transparent text-[#736B76] hover:text-[#59172F]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'wishlist'
              ? 'border-[#59172F] text-[#59172F]'
              : 'border-transparent text-[#736B76] hover:text-[#59172F]'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>My Wishlist ({wishlistProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#59172F] text-[#59172F]'
              : 'border-transparent text-[#736B76] hover:text-[#59172F]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Address</span>
        </button>
      </div>

      {/* Tab 1: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {loadingOrders ? (
            <div className="text-center py-12 text-xs text-[#736B76]">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DCDE] p-8 space-y-3">
              <Package className="w-12 h-12 text-[#C9A15B] mx-auto opacity-70" />
              <h3 className="font-serif text-lg font-bold text-[#59172F]">No Orders Placed Yet</h3>
              <p className="text-xs text-[#736B76] max-w-sm mx-auto">
                Explore our signature black beauty soaps, whipped body butters, and fine fragrances to start your order.
              </p>
              <button
                onClick={() => onNavigate('soaps')}
                className="mt-2 px-5 py-2.5 bg-[#59172F] text-white text-xs font-semibold rounded-xl"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DCDE] shadow-2xs hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#59172F]">
                          {order.reference}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#736B76]">
                        Placed on {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-lg font-bold text-[#59172F] block">
                        {formatNaira(order.total)}
                      </span>
                      <span className="text-[11px] text-[#736B76]">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Summary of items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs bg-[#FFF9F2] p-2 rounded-lg">
                        {item.image && (
                          <img
                            src={resolveAssetUrl(item.image)}
                            alt={item.name}
                            className="w-9 h-9 rounded object-cover shrink-0"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-[#29232B] truncate">{item.name}</p>
                          <p className="text-[11px] text-[#736B76]">
                            Qty: {item.quantity} • {formatNaira(item.lineTotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action row */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[#736B76]">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A15B]" />
                      <span>{order.delivery.town}, {order.delivery.state}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={getWhatsAppOrderLink(
                          order.reference,
                          order.total,
                          order.items.length,
                          order.delivery.town
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Status</span>
                      </a>

                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="px-3.5 py-1.5 bg-[#59172F] hover:bg-[#431022] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C9A15B]" />
                        <span>View Full Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Wishlist (As Requested) */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DCDE] p-8 space-y-3">
              <Heart className="w-12 h-12 text-[#C9A15B] mx-auto opacity-70" />
              <h3 className="font-serif text-lg font-bold text-[#59172F]">Your Wishlist is Empty</h3>
              <p className="text-xs text-[#736B76] max-w-sm mx-auto">
                Save your favorite soaps, perfumes, or body care items by tapping the heart icon on any product.
              </p>
              <button
                onClick={() => onNavigate('soaps')}
                className="mt-2 px-5 py-2.5 bg-[#59172F] text-white text-xs font-semibold rounded-xl"
              >
                Discover Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-[#E8DCDE] overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div
                    onClick={() => onSelectProduct(product)}
                    className="cursor-pointer group relative aspect-square bg-[#FAF5EE] overflow-hidden"
                  >
                    <img
                      src={resolveAssetUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#C9A15B]">
                        {product.category}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-[#29232B] line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-sm font-bold text-[#59172F] font-mono tabular-nums mt-1">
                        {formatNaira(product.price)}
                      </p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => moveToCart(product)}
                        className="flex-1 py-2 bg-[#59172F] hover:bg-[#431022] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#C9A15B]" />
                        <span>Move to Bag</span>
                      </button>

                      <button
                        onClick={() => toggleWishlist(product)}
                        className="px-2.5 py-2 border border-slate-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        title="Remove from Wishlist"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Profile & Address */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs max-w-2xl space-y-6">
          <h2 className="font-serif text-lg font-bold text-[#59172F] border-b border-slate-100 pb-3">
            Update Personal Profile & Default Address
          </h2>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#29232B] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#29232B] mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="000-000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#29232B] mb-1">Default Street Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House number, street, landmark..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">Town / City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Ado-Ekiti, Akure"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#29232B] mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Ekiti State, Ondo State"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {profileSaved && (
              <p className="text-xs font-semibold text-emerald-700">
                ✨ Profile details successfully updated!
              </p>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#59172F] hover:bg-[#431022] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* Order Detail Modal with Brand Email View */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-8 border border-[#C9A15B] shadow-2xl space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A15B]">
                  Order Receipt
                </span>
                <h3 className="font-mono text-xl font-bold text-[#59172F]">
                  {selectedOrder.reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Status Timeline */}
            <div className="bg-[#FFF9F2] p-4 rounded-xl border border-[#E8DCDE] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#59172F]">Current Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="text-[11px] text-[#736B76]">
                <strong>Status History:</strong>
                <ul className="mt-1 space-y-1">
                  {selectedOrder.statusHistory.map((h, i) => (
                    <li key={i} className="flex justify-between">
                      <span>• {h.note || h.status}</span>
                      <span className="font-mono">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="font-serif text-sm font-bold text-[#29232B]">Order Items Snapshot:</h4>
              <div className="space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs py-1.5 border-b border-slate-50">
                    <div>
                      <p className="font-semibold text-[#29232B]">{item.name}</p>
                      <p className="text-[11px] text-[#736B76]">
                        {item.selectedVariant ? `${item.selectedVariant} • ` : ''}
                        Qty: {item.quantity} × {formatNaira(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-[#59172F]">{formatNaira(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery address & totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-800 mb-1">Delivery Destination:</p>
                <p className="text-slate-600">{selectedOrder.delivery.address}, {selectedOrder.delivery.town}, {selectedOrder.delivery.state}</p>
                {selectedOrder.delivery.instructions && (
                  <p className="italic text-[11px] text-slate-500 mt-1">Note: {selectedOrder.delivery.instructions}</p>
                )}
              </div>
              <div className="space-y-1 text-right sm:text-right">
                <p className="text-slate-600">Subtotal: <span className="font-mono font-bold text-slate-900">{formatNaira(selectedOrder.subtotal)}</span></p>
                <p className="text-slate-600">Delivery: <span className="font-mono font-bold text-slate-900">{formatNaira(selectedOrder.deliveryFee)}</span></p>
                <p className="text-sm font-bold text-[#59172F]">Total: <span className="font-mono">{formatNaira(selectedOrder.total)}</span></p>
              </div>
            </div>

            {/* Automated Brand Email Notifications Log (As Requested) */}
            {orderEmails.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#59172F]">
                  <Mail className="w-4 h-4 text-[#C9A15B]" />
                  <span>Branded Email Notifications Sent to {selectedOrder.customer.email}:</span>
                </div>
                <div className="space-y-2">
                  {orderEmails.map((email) => (
                    <div key={email.id} className="p-3 bg-[#FFFDF9] rounded-xl border border-[#EADDCF] text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>{email.subject}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDate(email.sentAt)}</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Status &lsquo;{email.status}&rsquo; email generated & logged</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
