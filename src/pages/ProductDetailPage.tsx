import React, { useState, useEffect } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import type { Product } from '../types/index.ts';
import { formatNaira, getWhatsAppInquiryLink } from '../utils/formatters.ts';
import { useCart } from '../context/CartContext.tsx';
import { useWishlist } from '../context/WishlistContext.tsx';
import { useRecentlyViewed } from '../context/RecentlyViewedContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { RecentlyViewedSection } from '../components/RecentlyViewedSection.tsx';
import { resolveAssetUrl } from '../utils/assets.ts';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigate: (view: string, param?: string) => void;
  onPromptLogin: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onSelectProduct,
  onNavigate,
  onPromptLogin,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { trackProductView } = useRecentlyViewed();
  const { user, token, isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.sizeVariants && product.sizeVariants.length > 0 ? product.sizeVariants[0].size : undefined
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Review submission state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Track product view for recently viewed carousel
  useEffect(() => {
    trackProductView(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  // Fetch reviews for this product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchReviews();
  }, [product.id]);

  const isFavorited = isInWishlist(product.id);

  let currentPrice = product.price;
  if (selectedVariant && product.sizeVariants) {
    const v = product.sizeVariants.find((variant) => variant.size === selectedVariant);
    if (v) currentPrice = v.price;
  }

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleToggleWishlist = async () => {
    const success = await toggleWishlist(product);
    if (!success) onPromptLogin();
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      onPromptLogin();
      return;
    }
    setReviewError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review');
        return;
      }
      setReviews((prev) => [data.review, ...prev]);
      setReviewSubmitted(true);
      setReviewComment('');
    } catch (err: any) {
      setReviewError(err.message || 'Error submitting review');
    }
  };

  // Related products
  const related = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.isFeatured) && !p.isDraft)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#736B76]">
        <button onClick={() => onNavigate('home')} className="hover:text-[#59172F]">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate(product.category === 'body-care' ? 'body-care-combos' : product.category)} className="capitalize hover:text-[#59172F]">
          {product.category === 'body-care' ? 'Body Care' : product.category}
        </button>
        <span>/</span>
        <span className="text-[#29232B] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Contiguous Purchase Module & Gallery Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Image Showcase */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF5EE] border border-[#E8DCDE] shadow-sm">
            <img
              src={resolveAssetUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
              fetchPriority="high"
              decoding="async"
            />
            {product.advertisedSavings && (
              <span className="absolute top-4 right-4 bg-[#59172F] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#C9A15B] shadow-sm">
                Save {formatNaira(product.advertisedSavings)}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C9A15B]">
                {product.category === 'soaps'
                  ? 'Artisanal Beauty Soap'
                  : product.category === 'perfumes'
                  ? `Eau de Parfum • ${product.fragranceFamily || 'Fine Fragrance'}`
                  : product.category === 'combos'
                  ? 'More Glow • More Value • More You'
                  : 'Nourishing Body Care'}
              </span>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-2.5 rounded-full border transition-all ${
                  isFavorited
                    ? 'bg-[#59172F] text-white border-[#59172F]'
                    : 'bg-white text-slate-600 border-slate-200 hover:text-[#59172F]'
                }`}
                title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#59172F] leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Count */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <div className="flex text-[#C9A15B]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-slate-800">{product.rating}</span>
                <span className="text-[#736B76]">({product.reviewCount} customer reviews)</span>
              </div>
            )}
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="text-3xl font-bold text-[#59172F] font-mono tabular-nums">
              {formatNaira(currentPrice)}
            </span>
            {product.originalPrice && product.originalPrice > currentPrice && (
              <span className="text-base text-[#A098A2] line-through font-mono tabular-nums">
                {formatNaira(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#4A434D] leading-relaxed">
            {product.description}
          </p>

          {/* Size / Volume Variants (if perfumes or sized products) */}
          {product.sizeVariants && product.sizeVariants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#F0E6DE]">
              <label className="block text-xs font-bold text-[#29232B] uppercase tracking-wider">
                Select Volume / Size:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.sizeVariants.map((v) => (
                  <button
                    key={v.size}
                    type="button"
                    onClick={() => setSelectedVariant(v.size)}
                    className={`px-3.5 py-2 text-xs rounded-xl border transition-all ${
                      selectedVariant === v.size
                        ? 'border-[#59172F] bg-[#59172F] text-white font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-[#C9A15B]'
                    }`}
                  >
                    <span>{v.size}</span>
                    <span className="ml-2 font-mono tabular-nums opacity-90">{formatNaira(v.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Combo Components Breakdown */}
          {product.comboComponents && (
            <div className="bg-[#FAF5EE] p-4 rounded-xl border border-[#E8DCDE] space-y-2">
              <span className="text-xs font-bold text-[#59172F] uppercase tracking-wider block">
                Included in this Set:
              </span>
              <ul className="space-y-1.5 text-xs text-[#4A434D]">
                {product.comboComponents.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fragrance Notes if Perfume */}
          {product.fragranceNotes && (
            <div className="bg-[#FFF9F2] p-4 rounded-xl border border-[#E8DCDE] space-y-2">
              <span className="text-xs font-bold text-[#59172F] uppercase tracking-wider block">
                Olfactory Composition:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="font-semibold text-[#C9A15B] block">Top Notes</span>
                  <span className="text-[#4A434D]">{product.fragranceNotes.top.join(', ')}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#C9A15B] block">Heart Notes</span>
                  <span className="text-[#4A434D]">{product.fragranceNotes.heart.join(', ')}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#C9A15B] block">Base Notes</span>
                  <span className="text-[#4A434D]">{product.fragranceNotes.base.join(', ')}</span>
                </div>
              </div>
              {product.longevity && (
                <div className="text-[11px] text-[#736B76] pt-1">
                  <strong>Longevity:</strong> {product.longevity} • <strong>Sillage:</strong> {product.sillage}
                </div>
              )}
            </div>
          )}

          {/* Quantity Selector & Add to Bag Actions */}
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center justify-between border border-slate-200 rounded-xl bg-slate-50 p-1 w-28 sm:w-32 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 sm:p-2 hover:bg-white rounded-lg text-slate-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 sm:p-2 hover:bg-white rounded-lg text-slate-700 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Bag */}
              <button
                type="button"
                onClick={handleAddToCart}
                className={`flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 ${
                  addedAnimation
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#59172F] hover:bg-[#431022] text-[#FFF9F2]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#C9A15B]" />
                <span className="truncate">
                  {addedAnimation ? 'Added to Bag!' : `Add to Bag • ${formatNaira(currentPrice * quantity)}`}
                </span>
              </button>
            </div>

            {/* WhatsApp Direct Inquiry */}
            <a
              href={getWhatsAppInquiryLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 border border-emerald-600/40 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-95"
              title="Inquire about this product on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Inquire about this item on WhatsApp</span>
            </a>
          </div>

          {/* Delivery & Security Guarantees */}
          <div className="pt-3 border-t border-[#F0E6DE] grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs text-[#5D5560]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C9A15B] shrink-0" />
              <span>Doorstep Delivery in Ekiti & Ondo State</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C9A15B] shrink-0" />
              <span>Payment Arranged Upon Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ingredients & Benefits Full Details */}
      {(product.ingredients || product.benefits) && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DCDE] shadow-xs space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#59172F]">
            Formulation & Natural Goodness
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {product.ingredients && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A15B]">
                  Verified Botanical Ingredients
                </h4>
                <p className="text-xs sm:text-sm text-[#4A434D] leading-relaxed">
                  {product.ingredients}
                </p>
              </div>
            )}

            {product.benefits && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A15B]">
                  Proven Skin Benefits
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-[#4A434D]">
                  {product.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#C9A15B] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {product.usageInstructions && (
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A15B] mb-1">
                How to Use in Your Daily Ritual
              </h4>
              <p className="text-xs sm:text-sm text-[#4A434D] leading-relaxed">
                {product.usageInstructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8DCDE] shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#59172F]">
              Customer Reviews ({reviews.length})
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-[#736B76]">
              <div className="flex text-[#C9A15B]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span>Genuine feedback from verified shoppers</span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-[#736B76] italic py-4">
              No reviews yet for this product. Be the first to share your glow experience!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-[#FFF9F2] rounded-xl border border-[#E8DCDE] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#29232B]">{rev.customerName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#736B76]">
                    {new Date(rev.createdAt).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="flex text-[#C9A15B]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-slate-300'}`}
                    />
                  ))}
                </div>

                <p className="text-xs text-[#4A434D] leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Submit Review Form */}
        <div className="pt-6 border-t border-slate-100">
          <h3 className="font-serif text-lg font-bold text-[#59172F] mb-3">
            Write a Product Review
          </h3>

          {!isAuthenticated ? (
            <div className="bg-[#FAF5EE] p-4 rounded-xl text-center text-xs text-[#5D5560] space-y-2">
              <p>Please register or sign in to leave a review for your purchase.</p>
              <button
                onClick={onPromptLogin}
                className="px-4 py-2 bg-[#59172F] text-white text-xs font-bold rounded-lg"
              >
                Sign In to Review
              </button>
            </div>
          ) : reviewSubmitted ? (
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs font-semibold">
              ✨ Thank you! Your review has been submitted and posted.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'text-[#C9A15B] fill-current' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your experience with this product..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#29232B] focus:outline-none focus:border-[#C9A15B]"
                />
              </div>

              {reviewError && <p className="text-xs text-rose-600">{reviewError}</p>}

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#59172F] hover:bg-[#431022] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewedSection onSelectProduct={onSelectProduct} currentProductId={product.id} />
    </div>
  );
};
