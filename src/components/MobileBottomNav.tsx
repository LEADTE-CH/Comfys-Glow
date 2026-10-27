import React from 'react';
import { Home, Sparkles, Heart, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface MobileBottomNavProps {
  currentView: string;
  viewParam?: string;
  onNavigate: (view: string, param?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, viewParam, onNavigate }) => {
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { isAuthenticated } = useAuth();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      action: () => onNavigate('home'),
      isActive: currentView === 'home',
    },
    {
      id: 'soaps',
      label: 'Soaps',
      icon: Sparkles,
      action: () => onNavigate('soaps'),
      isActive: currentView === 'soaps' || currentView === 'perfumes' || currentView === 'body-care-combos',
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: Heart,
      badge: wishlistIds.length,
      action: () => {
        if (isAuthenticated) {
          onNavigate('account', 'wishlist');
        } else {
          onNavigate('auth', 'login');
        }
      },
      isActive: currentView === 'account' && viewParam === 'wishlist',
    },
    {
      id: 'cart',
      label: 'Bag',
      icon: ShoppingBag,
      badge: itemCount,
      action: () => setIsCartOpen(true),
      isActive: false,
    },
    {
      id: 'account',
      label: 'Account',
      icon: UserIcon,
      action: () => {
        if (isAuthenticated) {
          onNavigate('account', 'orders');
        } else {
          onNavigate('auth', 'login');
        }
      },
      isActive: currentView === 'account' || currentView === 'auth',
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#C9A15B]/30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`flex flex-col items-center justify-center py-1 transition-all group focus:outline-none ${
                active ? 'text-[#59172F]' : 'text-[#736B76] hover:text-[#59172F]'
              }`}
            >
              <div className="relative p-1">
                <Icon
                  className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    active ? 'text-[#59172F] stroke-[2.25]' : 'text-[#736B76]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-0.5 -right-1 min-w-[16px] h-4 px-1 bg-[#59172F] text-[#FFF9F2] text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight transition-colors ${
                  active ? 'font-bold text-[#59172F]' : 'font-medium text-[#736B76]'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="w-1 h-1 rounded-full bg-[#C9A15B] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
