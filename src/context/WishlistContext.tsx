import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/index.ts';
import { useAuth } from './AuthContext.tsx';
import { useCart } from './CartContext.tsx';

interface WishlistContextType {
  wishlistProducts: Product[];
  wishlistIds: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<boolean>;
  moveToCart: (product: Product) => void;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistProducts(data.products || []);
        setWishlistIds(data.productIds || []);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlistProducts([]);
      setWishlistIds([]);
    }
  }, [isAuthenticated, token]);

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = async (product: Product): Promise<boolean> => {
    if (!token || !isAuthenticated) {
      return false; // Caller can prompt login
    }
    try {
      const res = await fetch('/api/wishlist/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setWishlistIds(data.wishlist || []);
        if (data.added) {
          setWishlistProducts((prev) => [...prev, product]);
        } else {
          setWishlistProducts((prev) => prev.filter((p) => p.id !== product.id));
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
    }
    return false;
  };

  const moveToCart = (product: Product) => {
    addToCart(product, 1);
    toggleWishlist(product);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistProducts,
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        moveToCart,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
