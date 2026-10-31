import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  Star,
  Mail,
  Users,
  Settings,
  MessageSquare,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { supabase } from '../lib/supabase.ts';
import type { Order, Product, DeliveryZone, Review, BusinessSettings, EmailNotification } from '../types/index.ts';
import { formatNaira, formatDate } from '../utils/formatters.ts';
import { resolveAssetUrl } from '../utils/assets.ts';

export const AdminDashboard: React.FC<{ onNavigate: (view: string, param?: string) => void }> = ({ onNavigate }) => {
  const { user, token, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'products' | 'soaps' | 'delivery' | 'reviews' | 'emails' | 'customers' | 'settings' | 'messages'
  >('overview');

  // Stats & Data State
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // Filtering states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingZone, setEditingZone] = useState<Partial<DeliveryZone> | null>(null);
  const [previewEmailHtml, setPreviewEmailHtml] = useState<string | null>(null);

  // Status update modal / form
  const [newStatus, setNewStatus] = useState<Order['status']>('confirmed');
  const [statusNote, setStatusNote] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>('payment_confirmed_manually');
  const [internalNotes, setInternalNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const getValidToken = async (): Promise<string | null> => {
    if (token) return token;
    const { data } = (await supabase?.auth.getSession()) || {};
    return data?.session?.access_token || null;
  };

  // Initial Load
  const fetchAllAdminData = async () => {
    const currentToken = await getValidToken();
    if (!currentToken) return;
    const headers = { Authorization: `Bearer ${currentToken}` };

    try {
      // 1. Overview
      const resStats = await fetch('/api/admin/overview', { headers });
      if (resStats.ok) {
        const d = await resStats.json();
        setStats(d.stats);
      }

      // 2. Orders
      const resOrders = await fetch('/api/admin/orders', { headers });
      if (resOrders.ok) {
        const d = await resOrders.json();
        setOrders(d.orders || []);
      }

      // 3. Products (all, including draft soaps)
      const resProds = await fetch('/api/admin/products', { headers });
      if (resProds.ok) {
        const d = await resProds.json();
        setProducts(d.products || []);
      }

      // 4. Delivery Zones
      const resZones = await fetch('/api/admin/delivery-zones', { headers });
      if (resZones.ok) {
        const d = await resZones.json();
        setZones(d.zones || []);
      }

      // 5. Reviews
      const resRevs = await fetch('/api/admin/reviews', { headers });
      if (resRevs.ok) {
        const d = await resRevs.json();
        setReviews(d.reviews || []);
      }

      // 6. Emails
      const resEmails = await fetch('/api/admin/emails', { headers });
      if (resEmails.ok) {
        const d = await resEmails.json();
        setEmails(d.emails || []);
      }

      // 7. Customers
      const resCust = await fetch('/api/admin/customers', { headers });
      if (resCust.ok) {
        const d = await resCust.json();
        setCustomers(d.customers || []);
      }

      // 8. Settings
      const resSet = await fetch('/api/settings');
      if (resSet.ok) {
        const d = await resSet.json();
        setSettings(d.settings);
      }

      // 9. Messages
      const resMsg = await fetch('/api/admin/messages', { headers });
      if (resMsg.ok) {
        const d = await resMsg.json();
        setMessages(d.messages || []);
      }
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAllAdminData();
    }
  }, [isAdmin, token]);

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#59172F]">Administrator Access Required</h2>
        <p className="text-xs text-[#736B76]">
          You must be logged in as an authorized store administrator to access this control dashboard.
        </p>
        <button
          onClick={() => onNavigate('auth', 'login')}
          className="px-6 py-2.5 bg-[#59172F] text-white text-xs font-bold rounded-xl"
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  // --- Handlers ---
  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder) return;
    const currentToken = await getValidToken();
    if (!currentToken) {
      alert('Your administrator session has expired or is not ready. Please refresh or sign in again.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status updated to ${newStatus} by admin`,
          paymentStatus,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(`Order ${selectedOrder.reference} updated to ${newStatus}. Branded email sent!`);
        setSelectedOrder(data.order);
        fetchAllAdminData();
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        alert(data.error || 'Failed to update order status');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating order status');
    }
  };

  const handleSaveInternalNotes = async () => {
    if (!selectedOrder) return;
    const currentToken = await getValidToken();
    if (!currentToken) {
      alert('Your administrator session has expired.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ internalNotes }),
      });
      if (res.ok) {
        setActionSuccess('Internal notes saved.');
        fetchAllAdminData();
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save notes');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving notes');
    }
  };

  const handleResendEmail = async (statusToSend: string) => {
    if (!selectedOrder) return;
    const currentToken = await getValidToken();
    if (!currentToken) {
      alert('Your administrator session has expired.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/resend-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ status: statusToSend }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess(data.message);
        fetchAllAdminData();
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        alert(data.error || 'Failed to resend email');
      }
    } catch (err: any) {
      alert(err.message || 'Error resending email');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const currentToken = await getValidToken();
    if (!currentToken) {
      alert('Your administrator session has expired or is not ready. Please refresh or sign in again.');
      return;
    }

    try {
      const isNew = !editingProduct.id;
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(editingProduct),
      });

      if (res.ok) {
        setEditingProduct(null);
        setActionSuccess(isNew ? 'Product added successfully!' : 'Product updated successfully!');
        fetchAllAdminData();
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save product');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    const currentToken = await getValidToken();
    if (!currentToken) {
      alert('Your administrator session has expired.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (res.ok) {
        fetchAllAdminData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete product');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting product');
    }
  };

  const handleModerateReview = async (id: string, isApproved: boolean) => {
    const currentToken = await getValidToken();
    if (!currentToken) {
      alert('Your administrator session has expired.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/reviews/${id}/moderate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ isApproved }),
      });
      if (res.ok) {
        fetchAllAdminData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to moderate review');
      }
    } catch (e: any) {
      alert(e.message || 'Error moderating review');
    }
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;
    const currentToken = await getValidToken();
    if (!currentToken) {
      alert('Your administrator session has expired.');
      return;
    }
    try {
      const isNew = !editingZone.id;
      const url = isNew ? '/api/admin/delivery-zones' : `/api/admin/delivery-zones/${editingZone.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(editingZone),
      });
      if (res.ok) {
        setEditingZone(null);
        setActionSuccess(isNew ? 'Delivery zone created!' : 'Delivery zone updated!');
        fetchAllAdminData();
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save delivery zone');
      }
    } catch (e: any) {
      alert(e.message || 'Error saving delivery zone');
    }
  };

  // Filtered lists
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch =
      !orderSearch.trim() ||
      o.reference.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.includes(orderSearch) ||
      o.delivery.town.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter === 'all') return true;
    if (productCategoryFilter === 'drafts') return p.isDraft;
    return p.category === productCategoryFilter;
  });

  const soapDrafts = products.filter((p) => p.category === 'soaps');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Admin Title & Bar */}
      <div className="bg-[#59172F] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#C9A15B] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C9A15B] block">
            Store Owner Administration Desk
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Comfy’s Glow Master Dashboard
          </h1>
          <p className="text-xs text-[#E9DDF2]/80 mt-1">
            Ado-Ekiti Operational Control • Real Database Statistics • Automated Customer Emails
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/comfys-glow-project.zip"
            download="comfys-glow-project.zip"
            className="px-4 py-2 bg-[#C9A15B] hover:bg-[#b88f47] text-[#29232B] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
            title="Download full project source code as a universal ZIP"
          >
            <Package className="w-4 h-4" />
            <span>Download Project ZIP</span>
          </a>
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-semibold rounded-xl text-white transition-colors"
          >
            Storefront
          </button>
          <button
            onClick={fetchAllAdminData}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-[#E8DCDE] gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'products', label: `Catalogue (${products.length})`, icon: Package },
          { id: 'soaps', label: '5 Soap Varieties', icon: Sparkles },
          { id: 'delivery', label: 'Delivery Zones', icon: Truck },
          { id: 'emails', label: `Emails Log (${emails.length})`, icon: Mail },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { id: 'messages', label: `Inquiries (${messages.length})`, icon: MessageSquare },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-[#59172F] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white hover:text-[#59172F]'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-[#E8DCDE] shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-[#736B76] uppercase tracking-wider block">Total Orders</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#59172F] font-mono">{stats.totalOrders}</div>
              <span className="text-[11px] text-amber-700">{stats.pendingOrders} pending confirmation</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DCDE] shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-[#736B76] uppercase tracking-wider block">Total Revenue</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#59172F] font-mono">{formatNaira(stats.totalRevenue)}</div>
              <span className="text-[11px] text-emerald-700">From active orders</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DCDE] shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-[#736B76] uppercase tracking-wider block">Confirmed / Shipped</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#59172F] font-mono">{stats.confirmedOrders + stats.dispatchedOrders}</div>
              <span className="text-[11px] text-indigo-700">{stats.deliveredOrders} delivered</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DCDE] shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-[#736B76] uppercase tracking-wider block">Catalogue Count</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#59172F] font-mono">{stats.publishedProducts}</div>
              <span className="text-[11px] text-slate-500">{stats.draftSoapsCount} draft soap varieties</span>
            </div>
          </div>

          {/* Quick Recent Orders */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8DCDE] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#59172F]">Recent Customer Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-[#C9A15B] hover:underline"
              >
                View All Orders →
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono font-bold text-[#59172F]">{o.reference}</span>
                    <span className="text-[#736B76] ml-2">• {o.customer.fullName} ({o.delivery.town})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold">{formatNaira(o.total)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100">
                      {o.status}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedOrder(o);
                        setNewStatus(o.status);
                        setPaymentStatus(o.paymentStatus);
                        setInternalNotes(o.internalNotes || '');
                      }}
                      className="p-1 hover:text-[#59172F]"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#59172F]">Customer Orders</h3>
              <p className="text-xs text-[#736B76]">Search, filter, update statuses, record payment notes, and trigger automated emails.</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Reference, name, phone..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCDE] text-[#C9A15B] uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3">Reference</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FFF9F2] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#59172F] whitespace-nowrap">
                      {o.reference}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{o.customer.fullName}</div>
                      <div className="text-[11px] text-[#736B76]">{o.customer.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{o.delivery.town}</div>
                      <div className="text-[11px] text-[#736B76]">{o.delivery.state}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {formatNaira(o.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] uppercase bg-slate-100">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600">
                      {o.paymentStatus.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setNewStatus(o.status);
                          setPaymentStatus(o.paymentStatus);
                          setInternalNotes(o.internalNotes || '');
                        }}
                        className="px-2.5 py-1 bg-[#59172F] hover:bg-[#431022] text-white rounded-md text-[11px] font-semibold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PRODUCTS CATALOGUE MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#59172F]">Product Management</h3>
              <p className="text-xs text-[#736B76]">Manage prices, stock, variants, and draft publishing.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All Categories</option>
                <option value="soaps">Soaps</option>
                <option value="perfumes">Perfumes</option>
                <option value="body-care">Body Care</option>
                <option value="combos">Combo Sets</option>
                <option value="drafts">Drafts Only</option>
              </select>

              <button
                onClick={() =>
                  setEditingProduct({
                    name: '',
                    slug: '',
                    category: 'body-care',
                    price: 4000,
                    description: '',
                    image: resolveAssetUrl('/src/assets/images/comfy_hero_collection_1791541604861.jpg'),
                    stock: 50,
                    isDraft: false,
                    isFeatured: false,
                  })
                }
                className="px-4 py-2 bg-[#59172F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-[#FFF9F2] p-4 rounded-2xl border border-[#E8DCDE] flex flex-col justify-between space-y-3">
                <div className="flex gap-3">
                  <img
                    src={resolveAssetUrl(p.image)}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-[#C9A15B]">{p.category}</span>
                      {p.isDraft && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">DRAFT</span>
                      )}
                    </div>
                    <h4 className="font-semibold text-xs text-[#29232B] truncate">{p.name}</h4>
                    <p className="font-mono font-bold text-[#59172F] text-sm mt-0.5">{formatNaira(p.price)}</p>
                    <p className="text-[11px] text-[#736B76]">Stock: {p.stock} units</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="text-[#59172F] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="text-rose-600 hover:text-rose-800 p-1"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. THE 5 SOAP VARIETIES DEDICATED MANAGEMENT */}
      {activeTab === 'soaps' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C9A15B]">
              Business Requirement
            </span>
            <h3 className="font-serif text-xl font-bold text-[#59172F]">
              The 5 Soap Varieties Architecture
            </h3>
            <p className="text-xs text-[#736B76] mt-1 leading-relaxed">
              The business produces exactly five soap varieties. Variety #1 (Comfy Black Beauty Soap) is confirmed and published. Varieties #2 through #5 are stored as editable draft records here. Once the business owner provides final names, ingredients, and scents, edit and toggle them to &ldquo;Published&rdquo; to release them onto the live storefront.
            </p>
          </div>

          <div className="space-y-4">
            {soapDrafts.map((soap, index) => (
              <div key={soap.id} className="p-5 rounded-2xl border border-[#E8DCDE] bg-[#FFFDF9] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#59172F] text-white flex items-center justify-center font-serif font-bold text-sm shrink-0">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base font-bold text-[#29232B]">{soap.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${soap.isDraft ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {soap.isDraft ? 'DRAFT (Hidden from Storefront)' : 'PUBLISHED LIVE'}
                      </span>
                    </div>
                    <p className="text-xs text-[#736B76] mt-0.5">{soap.description}</p>
                    <p className="text-xs font-mono font-bold text-[#59172F] mt-1">Price: {formatNaira(soap.price)} • Stock: {soap.stock}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingProduct(soap)}
                    className="px-4 py-2 bg-[#59172F] text-white text-xs font-bold rounded-lg hover:bg-[#431022]"
                  >
                    Edit Variety 0{index + 1}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. DELIVERY MANAGEMENT TAB */}
      {activeTab === 'delivery' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#59172F]">Delivery Zones & Rates</h3>
              <p className="text-xs text-[#736B76]">Configure fees for Ekiti State towns and Akure. Rates update instantly on checkout.</p>
            </div>
            <button
              onClick={() =>
                setEditingZone({
                  state: 'Ekiti State',
                  areaName: '',
                  fee: 2000,
                  isServiceable: true,
                  estimatedDeliveryDays: '24–48 hours',
                })
              }
              className="px-4 py-2 bg-[#59172F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Delivery Zone</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className="p-4 rounded-2xl bg-[#FFF9F2] border border-[#E8DCDE] flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-[#C9A15B]">{zone.state}</span>
                    <span className="font-mono text-sm font-bold text-[#59172F]">{formatNaira(zone.fee)}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-[#29232B] mt-1">{zone.areaName}</h4>
                  <p className="text-[11px] text-[#736B76] mt-0.5">Timeline: {zone.estimatedDeliveryDays}</p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setEditingZone(zone)}
                    className="text-[#59172F] font-semibold hover:underline"
                  >
                    Edit Fee
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. EMAIL NOTIFICATIONS CENTER TAB (AS REQUESTED) */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-serif text-xl font-bold text-[#59172F]">
              Transactional Email Notification Logs
            </h3>
            <p className="text-xs text-[#736B76] mt-1">
              Automated brand-styled emails generated for Order Confirmed, Order Shipped, and Order Delivered statuses.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {emails.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 italic text-center">No transactional emails logged yet.</p>
            ) : (
              emails.map((e) => (
                <div key={e.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#59172F]">{e.subject}</span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {e.status}
                      </span>
                    </div>
                    <p className="text-[#736B76]">
                      Recipient: {e.recipientName} ({e.recipientEmail}) • Reference: {e.orderReference}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Sent at: {formatDate(e.sentAt)}</p>
                  </div>

                  <button
                    onClick={() => setPreviewEmailHtml(e.htmlBody)}
                    className="px-3.5 py-1.5 bg-[#FFF9F2] hover:bg-[#E9DDF2] text-[#59172F] border border-[#C9A15B] rounded-lg text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Brand Email HTML</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 7. REVIEWS MODERATION TAB */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-serif text-xl font-bold text-[#59172F]">Customer Reviews Moderation</h3>
            <p className="text-xs text-[#736B76]">Approve, hide, or remove customer feedback.</p>
          </div>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-[#FFF9F2] rounded-xl border border-[#E8DCDE] flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#29232B]">{r.customerName}</span>
                    <span className="text-[11px] text-[#C9A15B]">★ {r.rating}/5</span>
                    <span className="text-[11px] text-[#736B76]">on {r.productName}</span>
                  </div>
                  <p className="text-xs text-[#4A434D]">{r.comment}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleModerateReview(r.id, !r.isApproved)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg ${r.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}
                  >
                    {r.isApproved ? 'Approved (Click to Hide)' : 'Hidden (Click to Approve)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. CUSTOMER DIRECTORY TAB */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#59172F] border-b border-slate-100 pb-4">
            Registered Customers ({customers.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[#C9A15B] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Orders</th>
                  <th className="py-2.5 px-3">Total Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{c.fullName}</td>
                    <td className="py-3 px-3 text-[#736B76]">{c.email}</td>
                    <td className="py-3 px-3">{c.phone}</td>
                    <td className="py-3 px-3">{c.city || 'N/A'}, {c.state || ''}</td>
                    <td className="py-3 px-3 font-bold">{c.orderCount}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#59172F]">{formatNaira(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. INQUIRIES & CONTACT MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#59172F] border-b border-slate-100 pb-4">
            Customer Inquiries & Contact Submissions
          </h3>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#E8DCDE] space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{m.subject}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{formatDate(m.createdAt)}</span>
                  </div>
                  <p className="text-[#59172F] font-medium">{m.name} ({m.phone}) {m.email ? `• ${m.email}` : ''}</p>
                  <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-100">{m.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 10. BUSINESS SETTINGS TAB */}
      {activeTab === 'settings' && settings && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCDE] shadow-xs space-y-6 max-w-2xl">
          <h3 className="font-serif text-xl font-bold text-[#59172F] border-b border-slate-100 pb-4">
            Store Contact & Business Settings
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone 1</label>
                <input
                  type="text"
                  value={settings.phones[0]}
                  onChange={(e) => {
                    const newP = [...settings.phones];
                    newP[0] = e.target.value;
                    setSettings({ ...settings, phones: newP });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone 2</label>
                <input
                  type="text"
                  value={settings.phones[1] || ''}
                  onChange={(e) => {
                    const newP = [...settings.phones];
                    newP[1] = e.target.value;
                    setSettings({ ...settings, phones: newP });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Delivery Policy Notice</label>
              <textarea
                rows={2}
                value={settings.deliveryNotice}
                onChange={(e) => setSettings({ ...settings, deliveryNotice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <button
              onClick={async () => {
                const currentToken = await getValidToken();
                if (!currentToken) {
                  alert('Your administrator session has expired.');
                  return;
                }
                const res = await fetch('/api/admin/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
                  body: JSON.stringify(settings),
                });
                if (res.ok) {
                  setActionSuccess('Business settings updated successfully!');
                  setTimeout(() => setActionSuccess(''), 3000);
                } else {
                  const data = await res.json().catch(() => ({}));
                  alert(data.error || 'Failed to update settings');
                }
              }}
              className="px-6 py-2.5 bg-[#59172F] text-white font-bold rounded-xl cursor-pointer"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ORDER STATUS & NOTIFICATION MANAGER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-[#C9A15B] shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#C9A15B]">Order Management</span>
                <h3 className="font-mono text-xl font-bold text-[#59172F]">{selectedOrder.reference}</h3>
                <p className="text-xs text-[#736B76]">{selectedOrder.customer.fullName} • {selectedOrder.customer.email}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Status change controls */}
            <div className="p-4 bg-[#FFF9F2] rounded-2xl border border-[#E8DCDE] space-y-4">
              <h4 className="font-serif text-sm font-bold text-[#59172F]">Update Order Status & Trigger Automated Email</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed (Triggers Brand Email)</option>
                    <option value="processing">Processing</option>
                    <option value="dispatched">Dispatched (Triggers Brand Email)</option>
                    <option value="delivered">Delivered (Triggers Brand Email)</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Confirmation</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="payment_pending">Payment Pending</option>
                    <option value="payment_confirmed_manually">Payment Confirmed Manually</option>
                    <option value="cash_on_delivery">Cash on Delivery Arranged</option>
                    <option value="bank_transfer_arranged">Bank Transfer Arranged</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Timeline Status Note</label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Handed to dispatch rider for Ikere delivery..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button
                onClick={handleUpdateOrderStatus}
                className="w-full py-2.5 bg-[#59172F] text-white text-xs font-bold rounded-xl hover:bg-[#431022] transition-colors"
              >
                Apply Status & Send Automated Customer Email
              </button>
            </div>

            {/* Quick Resend / Test Specific Email buttons */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#59172F] block">Direct Transactional Email Generator:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleResendEmail('confirmed')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Send className="w-3 h-3 text-[#C9A15B]" />
                  <span>Send &lsquo;Order Confirmed&rsquo; Email</span>
                </button>
                <button
                  onClick={() => handleResendEmail('dispatched')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Send className="w-3 h-3 text-[#C9A15B]" />
                  <span>Send &lsquo;Order Shipped&rsquo; Email</span>
                </button>
                <button
                  onClick={() => handleResendEmail('delivered')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Send className="w-3 h-3 text-[#C9A15B]" />
                  <span>Send &lsquo;Order Delivered&rsquo; Email</span>
                </button>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 block">Internal Admin Notes (Private)</label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Private notes for staff..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                onClick={handleSaveInternalNotes}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold"
              >
                Save Note
              </button>
            </div>

            {/* Itemized summary */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
              <div className="font-bold text-slate-800">Items Ordered:</div>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-50">
                  <span>{it.name} × {it.quantity}</span>
                  <span className="font-mono font-bold">{formatNaira(it.lineTotal)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm text-[#59172F] pt-2">
                <span>Grand Total:</span>
                <span>{formatNaira(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRODUCT EDIT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-[#C9A15B] shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#59172F]">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setEditingProduct(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select
                    value={editingProduct.category || 'soaps'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="soaps">Soaps</option>
                    <option value="perfumes">Perfumes</option>
                    <option value="body-care">Body Care</option>
                    <option value="combos">Combo Sets</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Price (₦) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Image URL / Path</label>
                  <input
                    type="text"
                    value={editingProduct.image || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!editingProduct.isDraft}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isDraft: !e.target.checked })}
                    className="accent-[#59172F]"
                  />
                  <span className="font-semibold text-slate-800">Publish Live to Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingProduct.isFeatured)}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="accent-[#59172F]"
                  />
                  <span className="font-semibold text-slate-800">Feature on Homepage</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#59172F] text-white font-bold rounded-lg"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELIVERY ZONE EDIT */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#C9A15B] shadow-2xl space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-[#59172F]">Configure Delivery Zone & Rate</h3>
            <form onSubmit={handleSaveZone} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">State</label>
                <input
                  type="text"
                  required
                  value={editingZone.state || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, state: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Coverage Area / Town Name</label>
                <input
                  type="text"
                  required
                  value={editingZone.areaName || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, areaName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Delivery Fee (₦)</label>
                <input
                  type="number"
                  required
                  value={editingZone.fee || 0}
                  onChange={(e) => setEditingZone({ ...editingZone, fee: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Estimated Timeline</label>
                <input
                  type="text"
                  value={editingZone.estimatedDeliveryDays || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, estimatedDeliveryDays: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingZone(null)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#59172F] text-white font-bold rounded-lg">Save Rate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BRAND EMAIL HTML PREVIEW */}
      {previewEmailHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#C9A15B] shadow-2xl">
            <div className="p-4 bg-[#59172F] text-white flex justify-between items-center">
              <span className="font-serif font-bold text-sm">Brand Transactional Email Live Preview</span>
              <button onClick={() => setPreviewEmailHtml(null)} className="text-white hover:text-[#C9A15B]">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#FFF9F2]">
              <iframe
                title="Email Preview"
                srcDoc={previewEmailHtml}
                className="w-full h-[600px] border-0 rounded-xl bg-white shadow-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
