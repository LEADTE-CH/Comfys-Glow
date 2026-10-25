import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';

interface RecentlyViewedContextType {
  recentlyViewed: Product[];
  trackProductView: (product: Product) => void;
  loading: boolean;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'comfys_glow_recently_viewed_guest';

export const RecentlyViewedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper to get guest IDs from sessionStorage (clears upon closing browser)
  const getGuestIds = (): string[] => {
    try {
      const stored = sessionStorage.getItem(GUEST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const fetchRecentlyViewed = async () => {
    setLoading(true);
    try {
      let url = '/api/recently-viewed';
      const headers: Record<string, string> = {};

      if (token && isAuthenticated) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        const guestIds = getGuestIds();
        if (!guestIds.length) {
          setRecentlyViewed([]);
          setLoading(false);
          return;
        }
        url += `?guestIds=${encodeURIComponent(JSON.stringify(guestIds))}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setRecentlyViewed(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching recently viewed products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentlyViewed();
  }, [isAuthenticated, token]);

  const trackProductView = (product: Product) => {
    // 1. Update UI state immediately
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 10);
    });

    // 2. Persist according to user type
    if (isAuthenticated && token) {
      fetch('/api/recently-viewed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      }).catch(() => {});
    } else {
      // Guest: save in sessionStorage (cleared on browser close)
      try {
        const currentIds = getGuestIds();
        const updated = [product.id, ...currentIds.filter((id) => id !== product.id)].slice(0, 10);
        sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('sessionStorage error:', e);
      }
    }
  };

  return (
    <RecentlyViewedContext.Provider
      value={{
        recentlyViewed,
        trackProductView,
        loading,
      }}
    >
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};
