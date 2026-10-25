import React, { Suspense, lazy, useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext.tsx';
import type { Product, Order } from './types/index.ts';

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

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

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
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleNavigate = (view: string, param?: string) => {
    if (view === 'reviews') {
      setCurrentView('home');
      setViewParam(undefined);
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
    setCurrentView(view);
    setViewParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderCompleted = (order: Order) => {
    setCompletedOrder(order);
    setCurrentView('order-confirmation');
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

        {currentView === 'order-confirmation' && completedOrder && (
          <OrderConfirmationPage
            order={completedOrder}
            onNavigate={handleNavigate}
          />
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
