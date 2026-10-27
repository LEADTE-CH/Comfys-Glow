import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.tsx';
import type { Product, Order, PublicOrderSummary } from './types/index.ts';

// Components
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';

// Pages load only when their view is first opened.
const Home = lazy(() => import('./pages/Home.tsx').then((module) => ({ default: module.Home })));
const SoapsPage = lazy(() => import('./pages/SoapsPage.tsx').then((module) => ({ default: module.SoapsPage })));
const PerfumesPage = lazy(() => import('./pages/PerfumesPage.tsx').then((module) => ({ default: module.PerfumesPage })));
const BodyCareCombosPage = lazy(() =>
  import('./pages/BodyCareCombosPage.tsx').then((module) => ({ default: module.BodyCareCombosPage }))
);
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage.tsx').then((module) => ({ default: module.ProductDetailPage }))
);
const CheckoutPage = lazy(() =>
  import('./pages/CheckoutPage.tsx').then((module) => ({ default: module.CheckoutPage }))
);
const OrderConfirmationPage = lazy(() =>
  import('./pages/OrderConfirmationPage.tsx').then((module) => ({ default: module.OrderConfirmationPage }))
);
const AccountPage = lazy(() =>
  import('./pages/AccountPage.tsx').then((module) => ({ default: module.AccountPage }))
);
const DeliveryPage = lazy(() =>
  import('./pages/DeliveryPage.tsx').then((module) => ({ default: module.DeliveryPage }))
);
const AboutPage = lazy(() => import('./pages/AboutPage.tsx').then((module) => ({ default: module.AboutPage })));
const ContactPage = lazy(() =>
  import('./pages/ContactPage.tsx').then((module) => ({ default: module.ContactPage }))
);
const FAQPage = lazy(() => import('./pages/FAQPage.tsx').then((module) => ({ default: module.FAQPage })));
const AuthPage = lazy(() => import('./pages/AuthPage.tsx').then((module) => ({ default: module.AuthPage })));
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard.tsx').then((module) => ({ default: module.AdminDashboard }))
);

interface AppRoute {
  view: string;
  param?: string;
  productKey?: string;
}

const getRouteFromLocation = (): AppRoute => {
  let segments: string[];
  try {
    segments = window.location.pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
  } catch {
    return { view: 'home' };
  }

  if (segments.length === 0) return { view: 'home' };
  if (segments[0] === 'products' && segments[1]) {
    return { view: 'product-detail', productKey: segments[1] };
  }
  if (segments[0] === 'account') return { view: 'account', param: segments[1] || 'orders' };
  if (segments[0] === 'auth') return { view: 'auth', param: segments[1] || 'login' };
  if (segments[0] === 'order-confirmation') {
    return { view: 'order-confirmation', param: segments[1] };
  }

  const views = [
    'soaps',
    'perfumes',
    'body-care-combos',
    'checkout',
    'order-confirmation',
    'delivery',
    'about',
    'contact',
    'faq',
    'admin',
  ];
  return views.includes(segments[0]) ? { view: segments[0] } : { view: 'home' };
};

const getPathForRoute = (route: AppRoute): string => {
  if (route.view === 'home') return '/';
  if (route.view === 'product-detail' && route.productKey) {
    return `/products/${encodeURIComponent(route.productKey)}`;
  }
  if (route.view === 'account') {
    return `/account/${encodeURIComponent(route.param || 'orders')}`;
  }
  if (route.view === 'auth') {
    return `/auth/${encodeURIComponent(route.param || 'login')}`;
  }
  if (route.view === 'order-confirmation' && route.param) {
    return `/order-confirmation/${encodeURIComponent(route.param)}`;
  }
  return `/${route.view}`;
};

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [initialRoute] = useState(getRouteFromLocation);
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [viewParam, setViewParam] = useState<string | undefined>(initialRoute.param);
  const [routeProductKey, setRouteProductKey] = useState<string | undefined>(initialRoute.productKey);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmationOrder, setConfirmationOrder] = useState<Order | PublicOrderSummary | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  // Fetch all published products
  const fetchProducts = async () => {
    try {
      const productsUrl = import.meta.env.PROD ? '/products.json' : '/api/products';
      const res = await fetch(productsUrl);
      if (!res.ok) {
        throw new Error(`Product request failed with status ${res.status}`);
      }

      const data = await res.json();
      setAllProducts(data.products || []);
      setProductsLoaded(true);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromLocation();
      setCurrentView(route.view);
      setViewParam(route.param);
      setRouteProductKey(route.productKey);
      if (route.productKey) {
        setSelectedProduct(
          allProducts.find((product) => product.slug === route.productKey || product.id === route.productKey) || null
        );
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allProducts]);

  useEffect(() => {
    if (!routeProductKey || !productsLoaded) return;

    const product = allProducts.find(
      (item) => item.slug === routeProductKey || item.id === routeProductKey
    );
    if (product) {
      setSelectedProduct(product);
      return;
    }

    setCurrentView('home');
    setViewParam(undefined);
    setRouteProductKey(undefined);
    window.history.replaceState(null, '', '/');
  }, [allProducts, productsLoaded, routeProductKey]);

  useEffect(() => {
    if (currentView !== 'order-confirmation' || !viewParam || confirmationOrder?.reference === viewParam) return;

    let cancelled = false;
    const fetchOrderSummary = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(viewParam)}`);
        if (!response.ok) {
          throw new Error(`Order request failed with status ${response.status}`);
        }

        const data = await response.json();
        if (!data.order) {
          throw new Error('Order response did not contain an order.');
        }

        if (!cancelled) {
          setConfirmationOrder(data.order);
          setConfirmationError(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading order confirmation:', error);
          setConfirmationError('We could not load this order confirmation. Please check the reference and try again.');
        }
      }
    };

    fetchOrderSummary();
    return () => {
      cancelled = true;
    };
  }, [confirmationOrder, currentView, viewParam]);

  const navigateTo = (route: AppRoute) => {
    window.history.pushState(null, '', getPathForRoute(route));
    setCurrentView(route.view);
    setViewParam(route.param);
    setRouteProductKey(route.productKey);
    if (route.productKey) {
      setSelectedProduct(
        allProducts.find((product) => product.slug === route.productKey || product.id === route.productKey) || null
      );
    } else {
      setSelectedProduct(null);
    }
  };

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'reviews') {
      navigateTo({ view: 'home' });
      setTimeout(() => {
        const el = document.getElementById('reviews');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
      return;
    }
    navigateTo({ view, param });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    navigateTo({ view: 'product-detail', productKey: product.slug || product.id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCompleted = (order: Order) => {
    setConfirmationOrder(order);
    setConfirmationError(null);
    navigateTo({ view: 'order-confirmation', param: order.reference });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#29232B] font-sans antialiased selection:bg-[#E9DDF2] selection:text-[#59172F]">
      {/* Universal Luxury Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-20 md:pb-0">
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#736B76]" role="status">
              Loading page...
            </div>
          }
        >
        {currentView === 'home' && (
          <Home
            products={allProducts}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
            onPromptLogin={() => handleNavigate('auth', 'login')}
          />
        )}

        {currentView === 'soaps' && (
          <SoapsPage
            products={allProducts}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
            onPromptLogin={() => handleNavigate('auth', 'login')}
          />
        )}

        {currentView === 'perfumes' && (
          <PerfumesPage
            products={allProducts}
            onSelectProduct={handleSelectProduct}
            onPromptLogin={() => handleNavigate('auth', 'login')}
          />
        )}

        {currentView === 'body-care-combos' && (
          <BodyCareCombosPage
            products={allProducts}
            onSelectProduct={handleSelectProduct}
            onPromptLogin={() => handleNavigate('auth', 'login')}
          />
        )}

        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            allProducts={allProducts}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
            onPromptLogin={() => handleNavigate('auth', 'login')}
          />
        )}

        {currentView === 'checkout' && (
          <CheckoutPage
            onOrderCompleted={handleOrderCompleted}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'order-confirmation' && (
          !viewParam || confirmationError ? (
            <div className="min-h-[40vh] flex items-center justify-center px-4 text-sm text-[#736B76]" role="alert">
              {confirmationError || 'An order reference is required to view this confirmation.'}
            </div>
          ) : confirmationOrder && confirmationOrder.reference === viewParam ? (
            <OrderConfirmationPage order={confirmationOrder} onNavigate={handleNavigate} />
          ) : (
            <div className="min-h-[40vh] flex items-center justify-center text-sm text-[#736B76]" role="status">
              Loading order confirmation...
            </div>
          )
        )}

        {currentView === 'account' && (
          <AccountPage
            initialTab={viewParam || 'orders'}
            onSelectProduct={handleSelectProduct}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'delivery' && <DeliveryPage onNavigate={handleNavigate} />}

        {currentView === 'about' && <AboutPage onNavigate={handleNavigate} />}

        {currentView === 'contact' && <ContactPage />}

        {currentView === 'faq' && <FAQPage onNavigate={handleNavigate} />}

        {currentView === 'auth' && (
          <AuthPage
            initialMode={(viewParam as any) || 'login'}
            onSuccess={() => handleNavigate(viewParam === 'checkout' ? 'checkout' : 'home')}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onNavigate={handleNavigate} />
        )}
        </Suspense>
      </main>

      {/* Universal Luxury Footer */}
      <Footer
        onNavigate={handleNavigate}
      />

      {/* Mobile Sticky Luxury Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        viewParam={viewParam}
        onNavigate={handleNavigate}
      />

      {/* Global Slide-Over Cart Drawer */}
      <CartDrawer
        onCheckout={() => handleNavigate('checkout')}
        onContinueShopping={() => handleNavigate('soaps')}
      />

      {/* Global Live Search Dialog */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={allProducts}
        onSelectProduct={handleSelectProduct}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <RecentlyViewedProvider>
            <AppContent />
          </RecentlyViewedProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
