import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Phone,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  MessageCircle,
  Package,
  MapPin,
  Truck,
  Star,
  Info,
  HelpCircle,
  Flame,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { getWhatsAppInquiryLink } from '../utils/formatters.ts';
import { resolveAssetUrl } from '../utils/assets.ts';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();

  // Navigation & Drawer states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close dropdown on click outside
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  // Primary navigation links in the dedicated Menu Bar
  const menuBarLinks = [
    { id: 'home', label: 'Home' },
    { id: 'soaps', label: 'Black Soap' },
    { id: 'perfumes', label: 'Perfumes' },
    { id: 'body-care-combos', label: 'Glow Sets' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'delivery', label: 'Delivery Rates' },
    { id: 'about', label: 'Our Story' },
    { id: 'faq', label: 'Skin FAQs' },
    { id: 'contact', label: 'Contact Atelier' },
  ];

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-[#FFF9F2] shadow-xs select-none">
      {/* =========================================================================
          TIER 0: TOP NOTICES & DISPATCH STRIP
          ========================================================================= */}
      <div className="bg-[#59172F] text-[#FFF9F2] px-3 sm:px-6 py-1.5 text-xs font-medium tracking-wide border-b border-[#C9A15B]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Dispatch Notice & Phone */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="hidden sm:inline text-xs text-[#FFF9F2]/90 truncate">
              🌿 Pure Botanical Skincare & Luxury Fragrances · Ado-Ekiti Atelier
            </span>
            <span className="hidden md:inline text-[#C9A15B]/50">|</span>
            <a
              href="tel:0000000000"
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#FFF9F2] hover:text-[#C9A15B] transition-colors shrink-0"
            >
              <Phone className="w-3 h-3 text-[#C9A15B]" />
              <span>
                Store: <strong className="font-semibold">000-000-0000</strong>
              </span>
            </a>
          </div>

          {/* Right: Delivery highlights */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="text-[11px] sm:text-xs text-[#E9DDF2] hidden sm:inline">
              Same-day Ekiti & Ondo Delivery
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TIER 1: MAIN BRAND HEADER (Logo, Search, User, Bag)
          ========================================================================= */}
      <div className="bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8DCDE]/70">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6 h-16 sm:h-20">
            {/* Mobile Hamburger (Visible on small screens) */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-1 text-[#59172F] hover:bg-[#FAF5EE] rounded-xl transition-colors cursor-pointer border border-[#C9A15B]/40 active:scale-95"
                title="Open boutique menu"
                aria-label="Open menu drawer"
              >
                <div className="w-5 h-4 flex flex-col justify-between py-0.5" aria-hidden="true">
                  <span className="w-full h-0.5 bg-[#59172F] rounded-full" />
                  <span className="w-3/4 h-0.5 bg-[#59172F] rounded-full" />
                  <span className="w-full h-0.5 bg-[#59172F] rounded-full" />
                </div>
              </button>
            </div>

            {/* Brand Logo & Wordmark (Properly anchored) */}
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 sm:gap-3.5 text-left group focus:outline-none cursor-pointer shrink-0"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full p-0.5 border-2 border-[#C9A15B] shadow-xs bg-white overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                <img
                  src={resolveAssetUrl('/src/assets/images/comfys_glow_logo_1791541553890.jpg')}
                  alt="Comfy's Glow Logo"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base sm:text-2xl font-bold tracking-tight text-[#59172F] group-hover:text-[#5B286F] transition-colors leading-none">
                  Comfy’s Glow
                </span>
                <span className="hidden sm:block text-[8px] sm:text-[9.5px] tracking-[0.22em] uppercase font-semibold text-[#C9A15B] leading-none mt-1">
                  Luxury Botanicals & Fragrance
                </span>
              </div>
            </button>

            {/* Desktop Center: Spacious Quick Search Bar */}
            <div className="hidden xl:flex flex-1 max-w-lg mx-4">
              <button
                type="button"
                onClick={onOpenSearch}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-[#FAF5EE] hover:bg-white border border-[#E8DCDE] hover:border-[#C9A15B] rounded-full text-xs text-[#736B76] transition-all shadow-xs cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Search className="w-4 h-4 text-[#C9A15B] shrink-0" />
                  <span className="truncate">Search soaps, perfumes, body scrubs, bundles...</span>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-semibold text-[#59172F] bg-white border border-[#C9A15B]/30 rounded-full shrink-0 group-hover:bg-[#59172F] group-hover:text-white transition-colors">
                  Search
                </span>
              </button>
            </div>

            {/* Right Action Suite (Search, WhatsApp, Wishlist, Account, Bag) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Mobile Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="xl:hidden p-2 text-[#29232B] hover:text-[#59172F] hover:bg-[#FAF5EE] rounded-full transition-colors cursor-pointer"
                title="Search store products"
                aria-label="Search products"
              >
                <Search className="w-5 h-5 text-[#59172F]" />
              </button>

              {/* Direct WhatsApp Concierge Button */}
              <a
                href={getWhatsAppInquiryLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-semibold transition-all shadow-xs"
                title="Direct WhatsApp Concierge"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>

              {/* Wishlist Button */}
              <div className="hidden md:block">
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      onNavigate('account', 'wishlist');
                    } else {
                      onNavigate('auth', 'login');
                    }
                  }}
                  className="relative p-2 text-[#29232B] hover:text-[#59172F] hover:bg-[#FAF5EE] rounded-full transition-colors cursor-pointer"
                  title={isAuthenticated ? 'My Wishlist' : 'Sign in for Wishlist'}
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5 text-[#59172F]" />
                  {wishlistIds.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#59172F] text-[#FFF9F2] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {wishlistIds.length}
                    </span>
                  )}
                </button>
              </div>

              {/* User Account / Sign In Dropdown */}
              <div className="relative hidden md:block">
                {isAuthenticated ? (
                  <div>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border border-[#C9A15B]/40 hover:border-[#C9A15B] rounded-full text-xs font-medium text-[#59172F] bg-white transition-all shadow-xs cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#59172F] text-white flex items-center justify-center text-[10px] font-bold">
                        {user?.fullName.charAt(0) || 'U'}
                      </div>
                      <span className="max-w-[70px] sm:max-w-[90px] truncate font-semibold hidden xs:inline">
                        {user?.fullName.split(' ')[0]}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-[#E8DCDE] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <div className="text-xs font-bold text-[#29232B] truncate">{user?.fullName}</div>
                          <div className="text-[11px] text-[#736B76] truncate">{user?.email}</div>
                          {isAdmin && (
                            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#E9DDF2] text-[#59172F]">
                              <ShieldCheck className="w-3 h-3 text-[#59172F]" />
                              Administrator
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('account', 'orders');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-[#29232B] hover:bg-[#FAF5EE] hover:text-[#59172F] transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-[#C9A15B]" />
                            <span>My Orders & Tracking</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('account', 'wishlist');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-[#29232B] hover:bg-[#FAF5EE] hover:text-[#59172F] transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-[#C9A15B]" />
                            <span>My Wishlist ({wishlistIds.length})</span>
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        </button>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-[#59172F] font-bold hover:bg-[#FAF5EE] transition-colors flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#C9A15B]" />
                              <span>Admin Portal</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                          </button>
                        )}

                        <div className="border-t border-slate-100 my-1.5" />

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            onNavigate('home');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onNavigate('auth', 'login')}
                    className="px-3 py-1.5 border border-[#C9A15B] hover:bg-[#C9A15B] hover:text-white rounded-full text-xs font-bold text-[#59172F] transition-all whitespace-nowrap cursor-pointer shadow-xs active:scale-95"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Shopping Bag Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2] rounded-full transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#C9A15B]" />
                <span className="hidden xs:inline text-xs font-bold tracking-wide">Bag</span>
                <span className="w-5 h-5 bg-[#C9A15B] text-[#29232B] text-xs font-extrabold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: THE DEDICATED MENU BAR (PLACED IN THE RIGHT PLACE)
          ========================================================================= */}
      <nav
        aria-label="Main Navigation Menu Bar"
        className="bg-[#FAF5EE] border-b border-[#C9A15B]/30 shadow-2xs relative z-30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-11">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex xl:hidden items-center gap-2 px-2 py-1.5 rounded-lg text-[#59172F] font-bold uppercase tracking-wider text-xs"
              aria-label="Open all categories"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
            </button>

            {/* Left: Dedicated Hamburger Button with Label */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="group hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-[#FAF0E1] text-[#59172F] transition-colors cursor-pointer border border-transparent hover:border-[#C9A15B]/50 shrink-0"
              title="Open all boutique categories & directory"
            >
              <div className="w-4 h-3.5 flex flex-col justify-between py-0.5" aria-hidden="true">
                <span className="w-full h-0.5 bg-[#59172F] group-hover:bg-[#C9A15B] rounded-full transition-colors" />
                <span className="w-3/4 h-0.5 bg-[#59172F] group-hover:bg-[#C9A15B] rounded-full transition-colors group-hover:w-full transition-all" />
                <span className="w-full h-0.5 bg-[#59172F] group-hover:bg-[#C9A15B] rounded-full transition-colors" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#59172F]">
                All Categories
              </span>
            </button>

            {/* Center: Curated Category Links */}
            <ul className="hidden min-w-0 flex-1 items-center justify-start gap-1 lg:gap-2 overflow-x-auto whitespace-nowrap text-xs xl:flex font-semibold uppercase tracking-[0.1em] text-[#29232B] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {menuBarLinks.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <li key={item.id} className="relative shrink-0">
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={`px-2.5 lg:px-3 py-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer relative ${
                        isActive
                          ? 'text-[#59172F] font-bold'
                          : 'text-[#29232B]/80 hover:text-[#59172F]'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#59172F] rounded-full" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Right: Atelier Trust Quality Note */}
            <div className="hidden">
              <Sparkles className="w-3 h-3 text-[#C9A15B]" />
              <span>100% Botanical · Non-Bleaching</span>
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          TIER 3: PROFESSIONAL SLIDE-OUT HAMBURGER MENU DRAWER
          ========================================================================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Boutique navigation menu drawer"
        >
          {/* Slide-out drawer panel from the Left */}
          <div className="w-full max-w-sm sm:max-w-md bg-[#FFFDF9] h-full shadow-2xl flex flex-col border-r-2 border-[#C9A15B]/50 animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8DCDE] bg-[#FAF5EE] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#C9A15B] overflow-hidden shadow-xs bg-white shrink-0">
                  <img
                    src={resolveAssetUrl('/src/assets/images/comfys_glow_logo_1791541553890.jpg')}
                    alt="Comfy's Glow Logo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#59172F] leading-tight">
                    Comfy’s Glow
                  </h3>
                  <p className="text-[10px] tracking-widest uppercase text-[#C9A15B] font-bold">
                    Organic Skincare · Fine Fragrance
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-500 hover:text-[#59172F] rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Drawer Quick Search */}
            <div className="p-3 bg-white border-b border-[#E8DCDE]">
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#FAF5EE] hover:bg-white border border-[#E8DCDE] rounded-xl text-xs text-[#736B76] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#C9A15B]" />
                  <span>Search soaps, perfumes, bundles...</span>
                </div>
                <span className="text-[10px] font-bold text-[#59172F] bg-white px-2 py-0.5 rounded border border-[#C9A15B]/30">
                  Search
                </span>
              </button>
            </div>

            {/* Scrollable Navigation Menu List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Account Quick Card */}
              {isAuthenticated ? (
                <div className="p-3.5 bg-[#FAF5EE] rounded-2xl border border-[#C9A15B]/40 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#59172F] text-white flex items-center justify-center font-bold text-sm border border-[#C9A15B] shrink-0">
                      {user?.fullName.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#29232B] truncate">{user?.fullName}</p>
                      <p className="text-[11px] text-[#736B76] truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        onNavigate('account', 'orders');
                      }}
                      className="py-1.5 px-2 bg-white rounded-xl text-xs font-semibold text-[#59172F] border border-slate-200 text-center flex items-center justify-center gap-1.5 hover:border-[#C9A15B] transition-colors cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-[#C9A15B]" />
                      <span>My Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        onNavigate('account', 'wishlist');
                      }}
                      className="py-1.5 px-2 bg-white rounded-xl text-xs font-semibold text-[#59172F] border border-slate-200 text-center flex items-center justify-center gap-1.5 hover:border-[#C9A15B] transition-colors cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-[#C9A15B]" />
                      <span>Wishlist ({wishlistIds.length})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-[#FAF5EE] rounded-2xl border border-[#C9A15B]/40 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#59172F]">Customer Portal</p>
                    <p className="text-[11px] text-[#736B76]">Sign in to track orders & save wishlist</p>
                  </div>
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      onNavigate('auth', 'login');
                    }}
                    className="px-3.5 py-1.5 bg-[#59172F] text-white rounded-xl text-xs font-bold hover:bg-[#431022] transition-colors cursor-pointer shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Collections & Departments */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A15B] px-2 block">
                  Boutique Collections
                </span>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('home');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'home'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9A15B]" />
                    <span>Home Sanctuary & Best Sellers</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('soaps');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'soaps'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9A15B]" />
                    <div>
                      <span>Artisanal Black Soaps</span>
                      <p className="text-[10px] text-[#736B76] font-normal">Carrot & Aloe Vera (₦4,200)</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#C9A15B] font-bold">Explore</span>
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('perfumes');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'perfumes'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#C9A15B]" />
                    <div>
                      <span>Luxury Perfumes & Scents</span>
                      <p className="text-[10px] text-[#736B76] font-normal">Arabian Oils & Oud</p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('body-care-combos');
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'body-care-combos'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C9A15B]" />
                    <span>Combos & Bundles</span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    Save ₦3,000
                  </span>
                </button>
              </div>

              {/* Client Services & Heritage */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A15B] px-2 block">
                  Client Services
                </span>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('reviews');
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'reviews'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Customer Reviews</span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-bold">4.9 ★</span>
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('delivery');
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'delivery'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C9A15B]" />
                    <span>Ekiti & Ondo Delivery Rates</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('about');
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'about'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-[#C9A15B]" />
                    <span>About Our Heritage</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('faq');
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'faq'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#C9A15B]" />
                    <span>Skin Routines & FAQs</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    onNavigate('contact');
                  }}
                  className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    currentView === 'contact'
                      ? 'bg-[#59172F] text-white shadow-xs'
                      : 'text-[#29232B] hover:bg-[#FAF5EE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C9A15B]" />
                    <span>Contact Atelier & Bank Road</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Direct Concierge & Orders */}
              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A15B] px-2 block">
                  Atelier Concierge
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:0000000000"
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#29232B] hover:border-[#C9A15B] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C9A15B]" />
                    <span>000-000-0000</span>
                  </a>
                  <a
                    href={getWhatsAppInquiryLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Side-Bar Bottom Footer */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
              <span className="text-xs text-[#736B76]">© Comfy’s Glow Atelier</span>
              <span className="text-xs text-[#C9A15B] font-bold">Glow with Elegance</span>
            </div>
          </div>

          {/* Backdrop click dismiss area */}
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu backdrop"
          />
        </div>
      )}
    </header>
  );
};
